# Notions clés — ilovecards

Ce document liste les concepts à maîtriser pour comprendre l'architecture du projet. Chaque titre est une affirmation : le lire suffit à saisir l'essentiel, le paragraphe approfondit et ancre dans le contexte concret du projet.

---

## Une base de données relationnelle organise les données en tables liées par des clés étrangères

PostgreSQL est la base du projet : les données sont structurées en lignes et colonnes (`User`, `Deck`, `Card`…). Les tables se référencent entre elles via des identifiants — `deckId` dans `Card` pointe vers `id` dans `Deck`. C'est une *clé étrangère*. PostgreSQL garantit l'intégrité : on ne peut pas créer une carte dans un deck qui n'existe pas.

---

## Un ORM traduit les opérations sur des objets TypeScript en requêtes SQL

Sans ORM, il faudrait écrire `SELECT * FROM "Card" WHERE "deckId" = $1`. Avec Prisma (l'ORM du projet), on écrit `prisma.card.findMany({ where: { deckId } })`. Le résultat est typé : TypeScript sait que chaque objet retourné a un champ `notion: string`, un `template: string`, etc. L'ORM génère le SQL, exécute la requête, et désérialise le résultat en objets.

---

## Le schéma Prisma est la source de vérité unique pour la structure de la base et les types TypeScript

`prisma/schema.prisma` décrit chaque table (*model*) avec ses champs et leurs types. C'est depuis ce fichier que Prisma génère à la fois les migrations SQL et le client TypeScript typé. Ajouter un champ dans le schéma nécessite deux étapes : créer une migration (pour la base) et relancer `prisma generate` (pour les types).

---

## Une migration est un fichier SQL versionné qui décrit comment faire évoluer le schéma

Quand le schéma change, on crée une migration : un fichier `migration.sql` horodaté dans `prisma/migrations/`. Il contient les instructions SQL (`ALTER TABLE`, `CREATE INDEX`…) pour passer de l'ancien état au nouveau. Prisma maintient une table `_prisma_migrations` en base qui trace les migrations déjà appliquées — il ne les rejoue jamais deux fois.

---

## Prisma génère un client TypeScript dans node_modules, ignoré par git

Après `prisma generate`, un fichier `node_modules/.prisma/client/index.d.ts` est créé — plusieurs milliers de lignes contenant les types de toutes les tables et les signatures typées de chaque méthode. Ce fichier n'est pas commité (ignoré par `.gitignore`) car il est regénéré depuis le schéma. C'est pourquoi le build Vercel commence toujours par `prisma generate`.

---

## PostgreSQL a une limite de connexions simultanées qu'une app serverless peut dépasser facilement

Chaque connexion à PostgreSQL consomme de la mémoire côté serveur (~5 Mo). La limite par défaut est ~100 connexions simultanées. Une architecture serverless ouvre une nouvelle connexion à chaque requête HTTP — avec du trafic, cette limite est atteinte rapidement et la base refuse les nouvelles connexions.

---

## PgBouncer est un proxy qui mutualise les connexions à PostgreSQL entre plusieurs fonctions

PgBouncer (le "pooler") s'intercale entre l'application et PostgreSQL. Il maintient un petit pool de vraies connexions et les partage entre les requêtes entrantes. Résultat : 1 000 fonctions serverless simultanées peuvent n'occuper que 10 connexions réelles. Neon intègre PgBouncer nativement — c'est pourquoi il fournit deux URLs : une poolée (`DATABASE_URL`) et une directe (`DATABASE_URL_UNPOOLED`).

---

## Neon est un PostgreSQL hébergé dans le cloud qui se met en veille quand il n'est pas utilisé

Neon est le fournisseur de base de données du projet. Sa particularité "serverless" : il éteint le moteur après quelques minutes d'inactivité et le rallume à la prochaine requête (avec une latence de ~500ms le temps du réveil). Il expose deux URLs de connexion : une via PgBouncer pour l'app, une directe pour les migrations.

---

## Une Serverless Function est une fonction hébergée sans serveur fixe, qui démarre à la demande

Les API routes du projet (`/api/*`) et les Server Components tournent sur Vercel en tant que Serverless Functions. Vercel les démarre à la réception d'une requête, exécute le code, puis libère les ressources. Elles ont accès à un environnement Node.js complet : système de fichiers, modules natifs, Prisma. Pas de serveur à maintenir, la mise à l'échelle est automatique.

---

## Un "cold start" est la latence de démarrage d'une Serverless Function non utilisée récemment

Si une fonction n'a pas été appelée depuis plusieurs minutes, Vercel doit instancier un nouveau container Node.js pour la servir. Ce démarrage à froid prend 200–500ms. Les fonctions fréquemment appelées restent "chaudes" et répondent immédiatement. Le proxy, qui intercepte toutes les requêtes, tourne sur Edge précisément pour éviter ce problème.

---

## Une Edge Function tourne dans un isolate V8 sans Node.js, démarrant en quelques millisecondes

V8 est le moteur JavaScript de Chrome. Une Edge Function est du JavaScript qui tourne directement dans V8, sans la couche Node.js qui apporte l'accès aux fichiers, au réseau natif, aux modules compilés. Démarrage quasi-instantané, exécution géographiquement proche de l'utilisateur. Contrepartie : Prisma (binaire natif) est incompatible.

---

## Le proxy intercepte toutes les requêtes entrantes pour vérifier l'authentification avant l'app

`src/proxy.ts` s'exécute pour chaque requête HTTP. Il lit le JWT dans le cookie, vérifie sa signature, et décide de laisser passer ou de rediriger vers `/login`. Ce gardien en amont garantit qu'aucune page protégée ne s'exécute jamais pour un utilisateur non connecté — sans charger la logique métier.

---

## Le pattern split-config Auth.js sépare la configuration selon l'environnement d'exécution

Auth.js complet utilise Prisma — incompatible avec Edge. Mais le proxy (Edge) a besoin d'Auth.js pour lire le JWT. Solution : deux fichiers. `auth.config.ts` contient uniquement ce qui est Edge-compatible (lecture du JWT depuis le cookie). `auth.ts` contient le reste (Prisma adapter, provider Resend) et n'est importé que dans les contextes Node.js.

---

## Un JWT est une chaîne signée qui prouve l'identité d'un utilisateur sans consulter la base

JSON Web Token : trois blocs en base64url séparés par des points — `header.payload.signature`. Le payload contient l'id utilisateur et la date d'expiration. La signature est un HMAC-SHA256 calculé avec `AUTH_SECRET`. Sans ce secret, il est impossible de forger une signature valide — le serveur peut donc vérifier l'identité uniquement depuis le token, sans requête en base.

---

## Base64url encode des données binaires en caractères lisibles et utilisables dans une URL

Les données binaires (octets d'une signature cryptographique par exemple) ne sont pas imprimables et peuvent contenir des caractères spéciaux problématiques dans une URL. Base64url les convertit en une chaîne de caractères alphanumériques + `-` et `_`. C'est pourquoi un JWT ressemble à une longue suite de lettres et chiffres apparemment aléatoires.

---

## HMAC-SHA256 produit une empreinte qui garantit qu'un message n'a pas été modifié

HMAC combine un secret et le contenu du message via la fonction de hachage SHA256 pour produire une empreinte unique de 256 bits. Si le contenu change d'un seul bit, l'empreinte change complètement. Sans connaître le secret, il est impossible de recalculer une empreinte valide. C'est ce mécanisme qui protège le JWT contre la falsification.

---

## L'authentification sans mot de passe envoie un lien à usage unique par email

Il n'y a pas de mot de passe dans ce projet. L'utilisateur entre son email, Auth.js génère un token aléatoire, le stocke en base, et envoie un lien par email via Resend. Quand l'utilisateur clique, Auth.js vérifie le token, crée un JWT, le stocke dans un cookie, et connecte l'utilisateur. Le token email est à usage unique et expire rapidement.

---

## Un cookie httpOnly est un stockage navigateur inaccessible au JavaScript de la page

Auth.js stocke le JWT dans un cookie `httpOnly`. L'attribut `httpOnly` empêche JavaScript d'y accéder via `document.cookie` — seul le navigateur peut l'envoyer automatiquement dans les requêtes HTTP. Cela protège le token contre le vol par injection de script (XSS). Le serveur (proxy, API routes) le reçoit dans chaque requête et peut lire le JWT.

---

## Resend est un service d'envoi d'emails transactionnels accessible via API HTTP

Resend expose une API pour envoyer des emails depuis le code (`resend.emails.send({ to, subject, html })`). Il gère la délivrabilité et la réputation de l'expéditeur. En développement, Auth.js remplace l'envoi réel par un `console.log` du magic link dans le terminal — aucun email n'est envoyé, le flux reste testable.

---

## React est une bibliothèque qui décrit l'interface comme une fonction de l'état

Un composant React est une fonction qui prend des `props` en entrée et retourne du JSX. Quand l'état change (via `useState`), React recalcule le rendu et met à jour le DOM de façon optimale. C'est le modèle déclaratif : on décrit ce que l'UI *doit être* selon l'état courant, pas comment la transformer manuellement.

---

## JSX est du HTML écrit en JavaScript, transformé en appels de fonctions à la compilation

`<div className="flex">Bonjour</div>` n'est pas du HTML — c'est du JSX. Le compilateur le transforme en `React.createElement("div", { className: "flex" }, "Bonjour")`. C'est pourquoi certains attributs diffèrent du HTML standard (`className` au lieu de `class`, `htmlFor` au lieu de `for`). JSX est une abstraction de confort, pas un nouveau langage.

---

## Un Server Component est rendu une seule fois côté serveur et n'envoie aucun JavaScript au client

En Next.js App Router, tous les composants sont Server Components par défaut. Ils s'exécutent sur le serveur, peuvent appeler Prisma directement, et envoient du HTML pur au navigateur — sans code JS de réhydratation. Ils ne peuvent pas avoir d'état local ni d'événements interactifs.

---

## "use client" déclare qu'un composant s'exécute dans le navigateur et peut être interactif

La directive `"use client"` en tête de fichier signale à Next.js que ce composant doit être envoyé et exécuté dans le navigateur. Il peut utiliser `useState`, `useEffect`, des `onClick`… Attention : cette directive crée une frontière — tous les imports de ce composant deviennent automatiquement clients aussi.

---

## L'hydratation est la phase où React attache l'interactivité au HTML déjà rendu par le serveur

Le serveur envoie du HTML statique (affiché immédiatement). Ensuite, React s'attache à ce HTML côté client pour y ajouter les event handlers et l'état — c'est l'hydratation. React rejoue virtuellement le rendu pour vérifier que son arbre correspond au HTML reçu. Une divergence déclenche une erreur d'hydratation visible en développement.

---

## Next.js App Router organise les routes par dossiers, avec des fichiers aux rôles précis

Dans `src/app/`, chaque dossier est un segment d'URL. `page.tsx` rend la page, `layout.tsx` englobe les enfants avec une structure partagée, `route.ts` définit une API. Les parenthèses `(app)` créent des groupes logiques sans impact sur l'URL. Les crochets `[id]` créent des routes dynamiques qui capturent un paramètre.

---

## Une API Route expose une fonction HTTP appelable depuis n'importe quel client

`src/app/api/cards/[id]/route.ts` exporte des fonctions `GET`, `POST`, `PUT`, `DELETE`. Ces fonctions tournent en Node.js côté serveur et ont accès à Prisma. Le client (composant React, application mobile, service tiers) les appelle avec `fetch("/api/cards/abc", { method: "DELETE" })`. C'est le point d'entrée standard pour toute opération de données depuis le client.

---

## Les verbes HTTP expriment l'intention d'une requête sur une ressource

`GET` lit, `POST` crée, `PUT`/`PATCH` modifie, `DELETE` supprime. Cette convention REST permet de distinguer l'action de la ressource : `DELETE /api/cards/123` et `GET /api/cards/123` ont le même chemin mais des effets opposés. Les navigateurs, caches, et proxies comprennent ces sémantiques et peuvent les optimiser ou les bloquer différemment.

---

## Les Server Actions sont des fonctions serveur appelables directement depuis un composant client

Avec la directive `"use server"`, une fonction async devient une Server Action. Next.js lui génère automatiquement un endpoint HTTP interne et la rend appelable comme une fonction normale depuis le client — sans écrire de route API manuellement. Pratique pour les mutations simples depuis un formulaire. Moins adapté aux opérations partagées entre plusieurs endroits.

---

## TypeScript détecte les erreurs de type à la compilation, avant l'exécution

TypeScript ajoute des annotations de types au JavaScript. L'éditeur et le compilateur signalent les erreurs avant même de lancer le code : appeler une méthode inexistante, passer un `string` là où un `number` est attendu, oublier un champ obligatoire. À la compilation, les types sont effacés — il ne reste que du JavaScript standard.

---

## Zod valide les données à l'exécution là où TypeScript ne peut rien garantir

TypeScript vérifie les types à la compilation, mais les données qui arrivent d'une API externe ou d'un formulaire HTML peuvent être n'importe quoi à l'exécution. Zod définit un schéma (`z.object({ notion: z.string().min(1) })`) et valide les données réelles contre ce schéma. Si la validation échoue, `safeParse` retourne une erreur structurée sans planter l'application.

---

## Tailwind CSS génère les règles CSS uniquement pour les classes effectivement utilisées dans le code

Tailwind propose des classes utilitaires (`flex`, `rounded-lg`, `text-sm`, `px-4`…) qui correspondent chacune à une ou quelques règles CSS. Lors du build, Tailwind scanne tous les fichiers source et ne génère que le CSS des classes trouvées — le reste est ignoré. Résultat : un fichier CSS minuscule en production, sans règles mortes.

---

## PostCSS est un transformateur de CSS qui orchestre des plugins, dont Tailwind

PostCSS lit un fichier `.css`, le fait passer par une chaîne de plugins, et produit du CSS standard compris par tous les navigateurs. Tailwind v4 est un plugin PostCSS : il analyse le source et génère les classes. Next.js déclenche PostCSS automatiquement lors du build. C'est transparent — on n'interagit jamais directement avec PostCSS.

---

## useReducer centralise la logique d'état complexe dans une fonction pure

Quand plusieurs `useState` interagissent, `useReducer` simplifie. On définit une fonction `reducer(state, action) => newState` et on lui envoie des actions nommées (`FLIP`, `DISMISS`, `FAIL`…). La logique est en un seul endroit, testable indépendamment du composant. C'est le pattern utilisé dans `ReviewSession` pour orchestrer la session de mémorisation.

---

## useEffect exécute du code après le rendu, pour les abonnements et effets de bord

`useEffect(() => { ... }, [deps])` permet d'exécuter du code après que React a mis à jour le DOM : écouter des événements clavier, lancer un timer, synchroniser un état avec l'extérieur. Le tableau de dépendances contrôle quand l'effet se relance. Une fonction de nettoyage (retournée par l'effet) est appelée avant le prochain lancement ou au démontage.

---

## La prop key permet à React d'identifier stablement chaque élément d'une liste

Quand React rend une liste de composants, il a besoin de savoir quel élément correspond à quoi si la liste change. La prop `key` (valeur unique dans la liste) sert d'identifiant stable. Dans le projet, `key={current.id}` sur `SwipeCard` force React à recréer le composant quand la carte change — ce qui réinitialise proprement l'état de drag.

---

## Le streaming NDJSON envoie chaque carte générée dès qu'elle est prête, sans attendre la fin

Au lieu d'attendre que l'IA génère toutes les cartes pour répondre en une seule fois, la route `/api/generate` envoie chaque carte dès qu'elle est disponible — une ligne JSON par carte, séparées par des retours à la ligne (NDJSON). Le composant client lit ce flux ligne par ligne et affiche chaque carte immédiatement, donnant un sentiment de rapidité.

---

## L'algorithme SM-2 calcule l'intervalle optimal avant la prochaine révision d'une carte

SM-2 (SuperMemo 2) est l'algorithme de répétition espacée. Il maintient deux valeurs par carte : l'`interval` (jours avant la prochaine révision) et l'`easeFactor` (facilité de la carte). Après une bonne réponse (`dismiss`), l'intervalle croît exponentiellement. Après un échec (`fail`), il repart à 1 jour. Objectif : réviser chaque carte *juste avant* qu'elle soit oubliée.

---

## Un pattern Singleton garantit qu'une seule instance d'un objet existe dans tout le processus

Le client Prisma est instancié en singleton : la première importation crée l'instance, les suivantes retournent la même. Sans ça, le hot-reload du serveur de dev recréerait une connexion DB à chaque modification de fichier et épuiserait le pool de connexions. L'instance est stockée dans `globalThis` pour survivre aux rechargements de modules.

---

## Les variables d'environnement externalisent les secrets et la configuration hors du code

Clés API, URLs de base de données, secrets de signature — ces valeurs ne doivent jamais être dans git. Elles sont stockées dans des variables d'environnement : un fichier `.env` en local (ignoré par git), et dans le dashboard Vercel en production. Le code y accède via `process.env.NOM_VARIABLE`. Le fichier `.env.example` documente les noms des variables sans exposer les valeurs.

---

## Vercel déploie automatiquement l'application à chaque push sur la branche principale

Vercel est connecté au repo GitHub. À chaque push, il clone le repo, installe les dépendances, exécute le build (`prisma generate && next build`), puis remplace la version en production — sans interruption de service. Les autres branches créent des "preview deployments" sur des URLs temporaires, permettant de tester avant de merger.

---

## L'Unsplash API retourne des photos libres de droits correspondant à une recherche textuelle

`GET https://api.unsplash.com/search/photos?query=ocean&orientation=portrait` retourne des photos correspondant au mot-clé, avec leurs URLs en plusieurs tailles. Une clé API (`Client-ID`) est requise dans le header `Authorization`. Dans le projet, elle est appelée lors de la génération IA ou de la sauvegarde d'une carte en template `photo-overlay`. Si la clé est absente, le template tombe en fallback sur un dégradé CSS.

---

## Un LLM génère du texte token par token, ce qui rend le streaming naturel

Les modèles de langage (Claude dans ce projet) produisent la réponse caractère par caractère ("token" par token). L'API Anthropic supporte le streaming : elle envoie chaque token dès sa génération plutôt que d'attendre la fin. Le serveur reçoit ce flux, l'interprète, assemble les cartes complètes, et les retransmet au client en NDJSON.

---

## Un système de crédits protège l'app contre une surconsommation de l'API IA

Chaque appel à l'API Anthropic coûte de l'argent. Le projet limite la consommation par utilisateur via un compteur de crédits stocké en base. Chaque génération décrémente le solde. Si le solde est nul, la génération est bloquée. Les utilisateurs `isPro` ont un solde `Infinity` côté serveur — le check est contourné avant même d'appeler l'API.

---

## Le partage de deck génère un token aléatoire qui sert d'identifiant public non-devinable

Quand le partage est activé, 12 octets aléatoires (`crypto.randomBytes`) sont encodés en base64url et stockés dans `shareToken`. L'URL `/s/[token]` est publique. L'aléatoire garantit qu'on ne peut pas deviner l'URL d'un deck sans l'avoir reçue. Désactiver le partage efface le token — l'ancienne URL devient invalide immédiatement.

---

## Une interface TypeScript décrit la forme d'un objet sans exister à l'exécution

`interface ReviewCard { id: string; notion: string }` est un contrat : TypeScript vérifie à la compilation que tout objet de ce type a bien ces propriétés. Mais les interfaces n'existent pas en JavaScript — elles disparaissent à la compilation. Elles n'ont aucun coût à l'exécution et servent uniquement à l'outillage (autocomplétion, vérification de types).

---

## git trace l'historique complet du code et permet de revenir à n'importe quel état antérieur

Chaque `git commit` crée un instantané de l'état du projet avec un message, une date, et un auteur. L'historique complet est conservé localement et sur GitHub. On peut revenir à un état antérieur, comparer deux versions, ou travailler en parallèle sur plusieurs branches. Vercel utilise cet historique pour déclencher les déploiements automatiquement.

---

## Les CSS custom properties (variables CSS) permettent de partager des valeurs entre composants sans JavaScript

`--color-accent: #6366f1` défini dans `:root` est accessible partout avec `var(--color-accent)`. Dans le projet, les couleurs d'accent des decks sont appliquées directement via des `style={{ backgroundColor: deck.accentColor }}` — des variables CSS auraient aussi pu être utilisées. Les custom properties sont dynamiques : elles peuvent être modifiées à l'exécution, contrairement aux variables Tailwind qui sont compilées.

---

## La répétition espacée est une technique d'apprentissage qui exploite la courbe de l'oubli

La mémoire humaine suit une "courbe de l'oubli" : on retient mieux une information si on la révise juste avant de l'oublier. La répétition espacée consiste à augmenter progressivement les intervalles entre les révisions d'une même carte. Une carte facile sera revue dans 10 jours, une difficile dans 1 jour. C'est l'algorithme SM-2 qui calcule ces intervalles.

---

## Un AbortSignal permet d'annuler une requête fetch si elle prend trop longtemps

`AbortSignal.timeout(5000)` crée un signal qui déclenche l'annulation après 5 secondes. Passé au `fetch`, il interrompt la requête si la réponse n'est pas arrivée à temps. Dans le projet, les appels à l'API Unsplash utilisent ce mécanisme : si le service est lent, on passe en fallback plutôt que de bloquer la génération.

---

## Le build Next.js analyse statiquement le code pour optimiser chaque route individuellement

Lors du `next build`, Next.js inspecte chaque page. Si elle est entièrement statique (pas de données à la requête), il la pré-rend en HTML au moment du build. Si elle est dynamique, il la marque pour le rendu à la demande. Cette analyse automatique produit le bundle JavaScript minimal pour chaque route — seul le code nécessaire est chargé.
