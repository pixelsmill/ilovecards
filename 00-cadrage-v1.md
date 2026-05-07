# Markdeck — Cadrage v1

> **Le pont entre la production de l'IA et ta mémoire à toi.**
> *Le langage de l'IA, c'est désormais le markdown — Markdeck en fait l'aboutissement durable.* Un *Skill* Cowork qui transforme un fichier Markdown en cartes belles et révisables, et une *PWA* mobile qui te les fait intérioriser au fil du temps. Le second cerveau qui refuse d'être délégué.

---

## 1. Pourquoi ce projet

À l'heure où les LLMs absorbent une part croissante du travail intellectuel, la pensée vivante reste — et restera — limitée à *ce qui est intériorisé dans la tête*. On peut penser **à propos de** ce qu'on a stocké dans Obsidian ; on ne peut penser **avec** que ce qu'on a vraiment retenu. Le mouvement *tools for thought* (Andy Matuschak, Michael Nielsen, "Quantum Country") a posé cette distinction : les **systèmes de prise de notes** et les **systèmes de mémoire** sont deux outils différents, et on a confondu les deux pendant 10 ans au profit du premier.

Et il y a une raison nouvelle, encore plus aiguë : **l'IA produit aujourd'hui plus de matière qu'on n'est capable d'en absorber**. Une synthèse de 4 pages générée en 20 secondes, un cours auto-rédigé, une note Markdown enrichie — on les lit en diagonale, on les sauvegarde dans un dossier "à relire", on n'y revient jamais. La masse générée déborde la capacité humaine d'intégration. C'est presque un *anti-second brain* : un cimetière de documents jamais intériorisés.

C'est ce diagnostic qui détermine la forme du produit. Markdeck **n'est pas une app à laquelle on va** ; c'est un **Skill qui vit là où tu travailles avec l'IA**. Tu génères un doc avec Claude, tu invoques le skill (`envoie ça dans memodeck`), il en extrait les cartes, et plus tard tu les retrouves sur ton téléphone pour les réviser. La PWA n'est pas le produit principal — c'est le lieu où la mémoire se construit, dans l'angle mort de ton attention quotidienne.

Markdeck se positionne sur le second. Pas un Anki-like de plus : un objet qui assume que la mémoire est précieuse, que l'IA peut *aider à formuler* ce qu'on apprend mais pas *apprendre à notre place*, et que l'esthétique d'une carte fait partie de sa pédagogie.

Trois personas en filigrane :
- **L'utilisatrice principale** : une étudiante qui rentre en prépa et qui doit absorber un volume de connaissances énorme.
- **Le builder** : un dev senior qui veut rester agile pendant que l'IA déforme son métier.
- **Le cœur** : un proche dont la mémoire faiblit, jamais nommé dans le produit, toujours en arrière-plan comme rappel que la mémoire mérite du soin.

---

## 2. Philosophie produit

Quatre principes qui doivent guider chaque arbitrage UX/code :

1. **La carte porte la matière, pas une question.** Le recto est *une notion formulée*, lisible, vraie en elle-même — pas un titre qui cache la réponse. La répétition n'est pas un quiz, c'est une rencontre répétée avec une vérité qu'on tient vivante.
2. **L'IA en service, jamais en remplacement.** L'IA propose des cartes à partir de notes ou de textes. L'humain valide, édite, ressent. L'acte de réviser n'est jamais délégable.
3. **Densité plutôt que volume.** Mieux vaut 100 cartes vraiment retenues que 5000 ignorées. Le produit met en avant la rétention, pas le nombre de cartes créées. On ajoute même de la friction si la file de révision déborde.
4. **L'esthétique comme pédagogie.** La carte est un bel objet. La face surprend (dopamine), le dos rassure (cohérence). On rompt avec la laideur des outils éducatifs.

---

## 3. Architecture

Trois composants, un flux unique :

```
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   SKILL (Cowork)        │    │   API (backend Next.js) │    │   PWA (mobile)          │
│                         │    │                         │    │                         │
│   • lit un .md          │ ─► │   • extrait via LLM     │ ◄─ │   • affiche les cartes  │
│   • appelle l'API       │    │   • stocke les cartes   │    │   • session de révision │
│   • affiche le récap    │    │   • sert les sessions   │    │   • dataviz             │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
   "Envoie ça en cartes"          (le cerveau silencieux)         "Fais-moi réviser"
```

**Le Skill** est volontairement léger (~100 lignes). Il fait trois choses : lire un fichier Markdown que l'utilisateur lui désigne (ou un texte issu de la conversation Cowork), appeler l'API Markdeck avec ce contenu, afficher dans le chat les cartes proposées pour validation. C'est le *point d'entrée* du produit — c'est là que l'utilisateur le rencontre quotidiennement.

**L'API (backend)** porte toute l'intelligence. Réception du MD, appel LLM (Anthropic ou OpenAI) pour extraire les notions sous forme de cartes structurées (notion + dos + template suggéré + tags), persistance Postgres, gestion de l'algo de répétition espacée, exposition d'endpoints REST. Le backend est *tenu* par les contraintes : tout endpoint doit être appelable depuis le Skill ET depuis la PWA — pas de logique propriétaire dans le front.

**La PWA** est la couche de consommation et d'engagement. Authentification, dashboard, session de révision belle et soignée, dataviz de la rétention. Elle n'a pas besoin de savoir *d'où* viennent les cartes : Skill, paste manuel dans la PWA, futurs imports — tout passe par le même endpoint. Cette neutralité est ce qui rend l'architecture extensible.

**Authentification entre Skill et API** : l'utilisateur génère une clé API dans la PWA (page Réglages), la copie dans la config locale du Skill (variable d'environnement Cowork). À partir de là, chaque appel du Skill est authentifié via un header `Authorization: Bearer <key>`. Pas de saisie d'identifiant à chaque utilisation, pas d'OAuth complexe pour la v1.

---

## 4. Modèle de carte

Chaque carte a deux faces et trois couches :

**Face (recto)** — un seul énoncé fort, courte phrase, écrite en *gros* sur une carte qui occupe presque tout l'écran. Le but : capter l'attention par l'objet visuel autant que par le contenu.

**Dos (verso)** — chartré, calme, lecture posée :
- Un développement (intuition, exemple, contre-exemple, mini-démonstration) — facultatif
- La provenance (livre + page, auteur, URL d'article, citation exacte si applicable)
- Les tags / le deck

**Templates de face** — 6 à 8 designs vraiment distincts (pas des variantes), pour que chaque carte soit *différente* et donne envie d'en voir la suivante :
- **Poster** — typo serif géante centrée, fond uni coloré
- **Magazine** — petite ligne d'intro, grande phrase, accent couleur
- **Quote** — guillemets démesurés, typo classique, fond crème
- **Photo overlay** — image Unsplash en fond, texte en surimpression, gradient
- **Color block** — fond bicolore franc, texte blanc qui traverse
- **Minimaliste** — dégradé pastel doux (sage, blush, lavande), typo très light, beaucoup d'air *(jamais blanc-sur-blanc : le recto a toujours une présence colorée)*
- **Equation/Code** — monospace centré, encadré, ambiance carnet
- **Saturé** — monochrome (terracotta, indigo, vert sapin), texte blanc

Le template est choisi à la création (manuellement parmi 6-8 mini-aperçus) ou suggéré automatiquement par l'IA en fonction du contenu (citation → Quote, équation → Equation, fait court → Poster, etc.).

---

## 5. Mécaniques d'interaction

L'app est mobile-first. Les gestes priment sur les boutons.

**En session de révision :**
- **Swipe droite** = "à revoir bientôt" → intervalle court (la carte revient vite)
- **Swipe gauche** = "acquise, plus tard" → intervalle long (la carte s'éloigne)
- **Swipe bas** (ou tap "ratée") = "je l'ai oubliée" → revoir dans la session ou dans quelques minutes
- **Tap simple** sur la carte = retournement face → dos pour voir le développement et la source

**Sur n'importe quelle carte (hors session ou en bibliothèque) :**
- **Long press** = menu radial avec les 4 actions principales : Éditer, Dupliquer, Changer de template, Supprimer

Cette pauvreté apparente du vocabulaire de gestes est intentionnelle : on apprend l'app en 30 secondes, et chaque geste est satisfaisant.

---

## 6. Scope v1 (4 semaines, ~50h)

### IN — strict nécessaire, organisé par composant

**Backend / API (le cerveau silencieux)**
- Auth utilisateur (magic link email)
- Génération de clés API par utilisateur (page Réglages dans la PWA)
- CRUD decks + cartes via REST
- Endpoint d'extraction `POST /api/extract` : reçoit un MD (ou texte brut), appelle le LLM (Anthropic ou OpenAI), retourne du JSON de cartes structurées (notion, dos, source, template suggéré, tags)
- Endpoint de batch save `POST /api/cards/batch` : reçoit un tableau de cartes validées, les persiste dans le deck cible
- Algo SM-2 (50 lignes, fonction pure, testée)
- Endpoint `GET /api/review/due` : cartes dues du jour pour l'utilisateur authentifié
- Endpoint `POST /api/review` : enregistre une réponse de session, met à jour le scheduling

**Skill Cowork (le point d'entrée quotidien)**
- Fichier `SKILL.md` qui décrit quand le skill se déclenche (`"envoie ça dans memodeck"`, `"crée des cartes à partir de ce MD"`, etc.)
- Script (~100 lignes) qui : lit un MD désigné, appelle `POST /api/extract`, affiche les cartes proposées dans le chat Cowork, attend validation utilisateur, appelle `POST /api/cards/batch` avec les cartes confirmées
- Config locale du Skill : la clé API utilisateur (variable d'environnement)
- Auto-détection du deck cible depuis la conversation, avec fallback sur "deck par défaut" ou question utilisateur

**PWA (la mémoire qui se construit)**
- Authentification (login magic link)
- Liste des decks et cartes
- Création/édition manuelle de cartes (avec sélecteur de template parmi 6 mini-aperçus)
- 6 templates de face designés à la main + dos chartré (cf. section 4)
- Session de révision avec swipes mobile-first (droite = à revoir bientôt, gauche = acquise, bas = ratée)
- Flip 3D face → dos
- PWA installable (manifest + service worker), offline pour les sessions déjà chargées
- Dashboard simple : cartes dues, courbe de rétention, streak
- Page Réglages avec génération de clé API
- *Bonus si temps* : input "coller un texte" depuis la PWA (réutilise le même endpoint que le Skill — gratuit en termes de code)

**Narration / déploiement**
- README ambitieux qui raconte le positionnement (anti-second brain, IA prépare l'humain s'engage)
- Page "About" dans la PWA avec la philosophie
- Seed de démo (deck "Citations philosophiques") pour les visiteurs
- Déploiement Vercel + Neon

### OUT — différé en roadmap (assumé dans le README)

- Intégration Obsidian (sync de vault complète)
- Import Anki `.apkg`
- Mode cloze (texte à trous)
- Notifications push (galère iOS, on s'en passe)
- FSRS (on reste sur SM-2)
- Sync multi-device avec gestion fine de conflits
- Decks partagés entre utilisateurs
- Génération d'images IA pour les cartes (on s'autorise Unsplash en v1, pas plus)
- Marketplace public de decks
- Distribution publique du Skill (publication sur la registry plugins Cowork) — on reste sur installation locale en v1

---

## 7. Modèle de données (préliminaire)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  decks       Deck[]
  apiKeys     ApiKey[]
  createdAt   DateTime @default(now())
}

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  hashedKey   String   @unique  // on stocke un hash, jamais la clé en clair
  prefix      String              // les 6 premiers caractères pour l'affichage ("mdk_a3f...")
  name        String              // ex. "Skill Cowork — laptop perso"
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  revokedAt   DateTime?
}

model Deck {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  description String?
  accentColor String   // identité visuelle du deck (hex)
  cards       Card[]
  // futur : visibility (private | shared | public), sharedWith User[]
  createdAt   DateTime @default(now())
}

model Card {
  id              String   @id @default(cuid())
  deckId          String
  deck            Deck     @relation(fields: [deckId], references: [id])
  notion          String   // la phrase recto
  development     String?  // dos enrichi
  sourceTitle     String?  // ex. "Penser, vite et lentement, p. 78"
  sourceUrl       String?
  template        String   // "poster" | "quote" | "magazine" | ...
  imageUrl        String?  // si template photo overlay
  // SM-2 state
  easeFactor      Float    @default(2.5)
  interval        Int      @default(0)   // jours avant prochaine révision
  repetitions     Int      @default(0)
  nextReviewAt    DateTime @default(now())
  reviews         Review[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Review {
  id        String   @id @default(cuid())
  cardId    String
  card      Card     @relation(fields: [cardId], references: [id])
  rating    Int      // 0=raté, 1=à revoir bientôt, 2=acquise
  reviewedAt DateTime @default(now())
}
```

---

## 8. Stack

**Backend + PWA (un seul projet Next.js)**
- **Next.js 15** (App Router, Route Handlers pour l'API) + **TypeScript**
- **Postgres** hébergé sur **Neon** (free tier, branches faciles)
- **Prisma** (ORM, types auto)
- **Tailwind CSS** + **shadcn/ui** retravaillé (palette + typo customs, pas le look shadcn de base)
- **next-pwa** pour la PWA (manifest + service worker)
- **Auth.js** (NextAuth) avec magic link (Resend pour l'email)
- **Anthropic API — Claude Haiku 4.5** (`claude-haiku-4-5-20251001`). Largement suffisant pour de l'extraction structurée, ~0,7 centime par extraction. *Pas d'optimisation (cache, rate limit) en v1 — on reverra si la consommation décolle. Coût mensuel attendu : entre le café et le pain au chocolat.*
- **Recharts** pour les graphiques (rétention, streak)
- **Unsplash API** pour les images de fond optionnelles
- **Vercel** pour l'hébergement (free tier suffit)
- **Framer Motion** *seulement* pour le flip 3D et les swipes (rien de plus)

**Skill Cowork (projet séparé, dans `./skill/`)**
- Structure standard Cowork : `SKILL.md` (description + déclencheurs) + un script (TypeScript via Bun, ou Python — ~100 lignes max)
- Pas de dépendances lourdes : juste `fetch` natif pour appeler l'API Markdeck
- Lecture du fichier MD via les outils Cowork standards (Read tool)
- Affichage des cartes dans le chat via le formatage Cowork classique (markdown)
- Config : variable d'environnement `MEMODECK_API_KEY` + `MEMODECK_API_URL`

---

## 9. Découpage 4 semaines

### Semaine 1 — Fondations (~12h)

- Setup projet Next.js (TS, Tailwind, Prisma, ESLint)
- Schéma BDD initial (User, **ApiKey**, Deck, Card, Review)
- Auth.js + magic link en local
- CRUD decks + cartes (une face de saisie minimale)
- *Déjà concevoir l'API REST pour qu'elle soit appelable de l'extérieur* (endpoints `/api/decks`, `/api/cards`, headers d'auth qui acceptent à la fois session NextAuth ET clé API)
- Déploiement Vercel + Neon dès le J1 — *important pour valider la chaîne et éviter le big-bang en semaine 4*

**Livrable** : on peut créer un compte, un deck, une carte, et la voir.

### Semaine 2 — Le moteur (~14h)

- Algo SM-2 (fonction pure testée)
- Endpoint `GET /api/review/due` (cartes dues du jour)
- Endpoint `POST /api/review` (enregistrer une réponse de session)
- Interface de session de révision (mobile-first)
- Implémentation des swipes (Framer Motion ou pure CSS + drag handlers)
- Flip 3D face → dos
- PWA manifest + service worker, installable sur iPhone et Android

**Livrable** : on peut faire une vraie session de révision sur le téléphone.

### Semaine 3 — Le différenciateur (~14h)

- 6 templates de face designés (composants React paramétrés)
- Sélecteur de template à la création (mini-aperçus cliquables)
- **Endpoint `POST /api/extract`** : reçoit un texte/MD, appelle Claude/GPT, retourne les cartes structurées en JSON. *C'est l'endpoint que le Skill appellera en semaine 4 — on le teste d'abord depuis la PWA via un input "coller du texte".*
- **Endpoint `POST /api/cards/batch`** pour le save en lot des cartes validées
- UI de validation/édition des cartes générées (preview + accepter/refuser/éditer)
- Long press → menu radial des actions
- Dashboard stats : cartes dues, rétention, streak, répartition par deck

**Livrable** : on colle un texte de cours dans la PWA, on obtient 4-6 belles cartes, on les valide, elles entrent en révision.

### Semaine 4 — Skill Cowork + polish + narration (~14h)

- **Page Réglages PWA : génération de clés API** (UI + endpoint `POST /api/keys`, hash bcrypt, affichage one-shot)
- **Écriture du Skill Cowork** dans `./skill/` (~6h) :
  - `SKILL.md` avec déclencheurs (`"envoie ça dans memodeck"`, `"crée des cartes"`, etc.)
  - Script qui lit le MD, appelle `/api/extract`, affiche les cartes proposées dans le chat, demande validation, appelle `/api/cards/batch`
  - Tests sur ton propre Cowork avec un MD réel
- Design system finalisé (palette, typo, mode sombre)
- Dataviz Recharts (courbe de rétention, séries de révisions)
- README ambitieux avec narration produit (anti-second brain, démo du Skill en GIF)
- Page "About" avec philosophie
- Seed data pour qu'un visiteur puisse essayer sans s'inscrire (deck démo)
- Accessibilité (focus visible, ARIA, contraste)
- Faire tester par l'utilisatrice principale en avant-première

**Livrable** : depuis Cowork, on dit "envoie ce MD dans memodeck", on valide les cartes proposées, le soir on les révise sur le téléphone. La boucle complète tourne.

---

## 10. Design system

### Palette

- **Fond clair** : `#FBF9F4` (crème, papier ivoire)
- **Fond sombre** : `#1A1814` (anthracite chaud)
- **Encre principale** : `#1A1814` clair / `#F2EEE5` sombre
- **Encre secondaire** : `#6B6356` clair / `#A39988` sombre
- **Accents par deck** (l'utilisateur choisit pour chaque deck) :
  - Terracotta `#C75D3F`
  - Indigo `#3B4F7C`
  - Vert sapin `#2E5044`
  - Ocre `#C68A3A`
  - Bordeaux `#7A2E3A`
  - Bleu canard `#1E4C5F`

### Typographie

- **Serif (notion)** : Source Serif 4 ou Spectral (Google Fonts) — pour la face en gros
- **Sans-serif (méta)** : Inter ou IBM Plex Sans — pour le dos, les boutons, les méta
- **Monospace** : JetBrains Mono — pour le template Equation/Code

### Géométrie

- Coins de carte : `border-radius: 24px`
- Ombre : `box-shadow: 0 24px 48px -12px rgba(0,0,0,.18)` (ombre douce, basse, longue)
- Ratio carte : portrait ~9/14, occupe ~85% de l'écran mobile
- Espacement : grille 8px

### Références visuelles à étudier

- [Quantum Country](https://quantum.country) — Andy Matuschak (référence philosophique + système intégré)
- [Mochi](https://mochi.cards) — l'app de flashcards la plus esthétique aujourd'hui
- [Readwise](https://readwise.io) — pour le côté "lecture sacrée"
- Cartes du jeu *Dixit* — pour la diversité visuelle assumée
- Éditions de la Pléiade — pour la dignité typographique

---

## 11. Risques et points d'attention

- **Le scope IA peut déraper.** Limiter à : "on colle un texte, on reçoit du JSON, on parse, on affiche". Pas de fine-tuning, pas de prompt engineering acrobatique en v1.
- **Les 6 templates sont un investissement réel** (probablement la moitié de la semaine 3). Ne pas les négliger : c'est *là* que se joue la différenciation.
- **Tester sur un vrai téléphone tôt et souvent.** Les swipes en simulateur mentent.
- **Ne pas se laisser tenter par le multi-utilisateur en v1.** C'est un trou noir.
- **Le README et la narration valent autant que le code.** Y consacrer une journée pleine n'est pas du temps perdu.

---

## 12. Décisions à arbitrer rapidement

- [x] **Clé API LLM** : **Anthropic Claude Haiku 4.5**. *À créer en début de semaine 1 sur [console.anthropic.com](https://console.anthropic.com) (l'abonnement Claude Max ne donne pas de clé API — ce sont deux produits distincts). Charger 5-10 € de crédits, ça tient plusieurs mois.*
- [x] **Nom final** : **Markdeck** — Markdown + Deck, descriptif et juste. *Note : un projet homonyme peu connu existe (générateur de slides MD par ar90n), risque de confusion modéré. Variantes de repli si besoin : `markdeck.cards`, `markdeck.app`, `getmarkdeck`, `mdeck`.*
- [x] **Premier deck de test** : **fondamentaux des échecs**. Le fixture de test est `samples/echecs-fondamentaux.md` — un guide AI-style généré pour Markdeck, qui simule exactement le type de doc qu'un utilisateur enverrait via le Skill. Inspiration thématique : [pousseurdebois.fr](https://www.pousseurdebois.fr/cours/jeu-d-echec-strategie/), mais le fichier n'en reprend pas le contenu — principes universels reformulés. Environ 35 notions, dans la veine du précédent side project sur la stratégie aux échecs.
- [ ] **Domaine** : on prend un `.com` / `.app` ou on reste sur l'URL Vercel pour la v1 ?
- [x] **Langage du Skill** : **TypeScript** (exécution via Bun ou Node depuis Cowork). Cohérent avec le reste de la stack (Next.js + TS), un seul vocabulaire à maintenir.
- [ ] **Distribution du Skill** : v1 = installation locale dans ton workspace de skills personnel (rapide). Plus tard = publication sur la registry plugins Cowork pour partage.

---

*Document initial — révisable au fil des semaines. Toute décision prise en cours de route doit être consignée ici pour garder le nord.*
