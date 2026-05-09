# Idées & retours utilisateurs

Idées en attente d'arbitrage, issues de retours d'utilisateurs réels.

---

## Images utilisateur — le cas botanique (herbier numérique)

**Contexte :** Un utilisateur veut créer des decks de botanique centrés sur la reconnaissance visuelle des plantes. Il a besoin d'attacher des photos à ses cartes — soit trouvées sur le web, soit prises directement avec l'appareil photo.

**Trois besoins distincts, de complexité croissante :**

1. **URL libre** — permettre à l'utilisateur de coller l'URL d'une image trouvée sur le web dans le formulaire de carte. Aucun stockage supplémentaire, fonctionne avec `imageUrl` déjà en base. Trivial à implémenter.

2. **Upload depuis l'appareil** (caméra ou pellicule) — `<input type="file" accept="image/*" capture="environment">` fonctionne dans tous les navigateurs mobiles sans rien installer. Nécessite un service de stockage de fichiers pour les images uploadées. **Vercel Blob** est le choix naturel (~$0.02/Go stocké/mois, ~$0.08/Go transféré). Les cas 1 et 2 ensemble couvrent entièrement le besoin botanique.

3. **Share target PWA** — apparaître dans la liste de partage iOS/Android quand l'utilisateur est dans l'app Photos. Nécessite que l'app soit installée sur l'écran d'accueil (PWA avec `manifest.json` + `share_target`). Si l'utilisateur n'a pas installé l'app, ilovecards n'apparaît pas dans la liste de partage du système. Chantier indépendant, à traiter dans une phase PWA.

**Recommandation :** Implémenter 1 + 2 en premier. Le cas botanique est entièrement couvert. Le share target peut attendre.

---

## Statut de validation des cartes générées par IA

**Contexte :** Une utilisatrice craint d'apprendre des notions erronées à cause des hallucinations de l'IA. Elle souhaite pouvoir distinguer les cartes qu'elle a vérifiées de celles qu'elle n'a pas encore contrôlées.

**Proposition :** Ajouter un champ `validated: Boolean` sur le modèle `Card` (défaut `false`). Les cartes générées par IA sont `non validées` par défaut. L'utilisateur les valide manuellement après avoir comparé le contenu avec son cours ou sa source de référence.

**UX :** La puce colorée qui identifie le deck sur la carte devient un **cadenas** tant que la carte n'est pas validée. Une fois validée, elle redevient la puce normale. Le statut est une propriété de la **carte**, pas du deck — on peut avoir un deck mixte avec des cartes validées et d'autres non.

**Points ouverts :**
- Où déclencher la validation ? Depuis la session de mémorisation (bouton dans le menu `⋮`) ? Depuis la liste des cartes du deck ? Les deux ?
- Faut-il un mode "révision de validation" qui ne montre que les cartes non validées ?
- Faut-il afficher un compteur de cartes non validées sur la page du deck ?
