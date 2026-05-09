# User Stories — idées en attente

Issues de retours d'utilisateurs réels. Pas encore planifiées.

---

## Images sur les cartes

### US-1 — Coller une URL d'image sur une carte

**En tant qu'** utilisateur qui trouve une photo sur le web,
**je veux** coller son URL dans le formulaire de création ou d'édition d'une carte,
**afin de** l'afficher comme visuel principal sans avoir à uploader quoi que ce soit.

**Critères d'acceptation :**
- Un champ "Image (URL)" est disponible dans le formulaire de carte
- Si une URL est renseignée, elle est utilisée comme `imageUrl` et affichée dans le template `photo-overlay`
- Le champ est optionnel — une carte sans image fonctionne comme aujourd'hui

---

### US-2 — Prendre ou importer une photo depuis l'appareil

**En tant qu'** utilisateur sur mobile qui veut photographier une plante, un schéma ou une page de cours,
**je veux** uploader une photo depuis ma pellicule ou en prendre une nouvelle directement,
**afin de** l'attacher à une carte sans passer par une URL externe.

**Critères d'acceptation :**
- Un bouton "Ajouter une photo" est disponible dans le formulaire de carte
- Il ouvre le sélecteur natif de l'appareil (pellicule ou caméra selon le choix de l'utilisateur)
- La photo est uploadée et stockée (Vercel Blob), son URL est enregistrée comme `imageUrl`
- Sur desktop, le même bouton ouvre un sélecteur de fichiers classique

---

### US-3 — Partager une photo vers ilovecards depuis l'app Photos

**En tant qu'** utilisateur qui a installé ilovecards sur son écran d'accueil,
**je veux** partager une photo directement depuis l'app Photos de mon téléphone vers ilovecards,
**afin de** créer ou compléter une carte sans ouvrir le navigateur.

**Critères d'acceptation :**
- ilovecards apparaît dans la liste de partage système iOS/Android
- Après le partage, l'utilisateur peut choisir d'attacher la photo à une carte existante ou d'en créer une nouvelle
- La photo est uploadée et stockée comme dans US-2

> **Note :** Nécessite que l'app soit installée comme PWA (via "Ajouter à l'écran d'accueil"). Non disponible pour les utilisateurs qui naviguent uniquement dans le navigateur. À traiter dans une phase PWA dédiée.

---

## Fiabilité des cartes générées par IA

### US-4 — Savoir d'un coup d'œil qu'une carte n'a pas encore été vérifiée

**En tant qu'** utilisateur qui craint d'apprendre des notions erronées générées par l'IA,
**je veux** voir un indicateur visuel sur les cartes non encore vérifiées,
**afin de** savoir lesquelles méritent d'être confrontées à ma source de référence avant de les mémoriser.

**Propriété :** `verified: Boolean` sur le modèle `Card`.

**Critères d'acceptation :**
- Toute carte créée ou modifiée par l'IA est marquée `verified: false` par défaut
- Les cartes créées manuellement sont marquées `verified: true` par défaut
- Sur la carte, la puce colorée du deck devient un **cercle vide** (outline, pas de remplissage, épaisseur 2px, même rayon extérieur) tant que `verified` est `false`
- Une fois vérifiée (`verified: true`), la puce redevient un disque plein de la couleur du deck
- Le statut est porté par la **carte**, pas le deck — un même deck peut contenir des cartes vérifiées et non vérifiées

---

### US-5 — Marquer une carte comme vérifiée après l'avoir confrontée à sa source

**En tant qu'** utilisateur qui vient de contrôler le contenu d'une carte avec son cours,
**je veux** marquer la carte comme vérifiée,
**afin de** ne plus la distinguer des cartes fiables et de suivre ma progression de relecture.

**Critères d'acceptation :**
- L'action "Marquer comme vérifiée" est accessible depuis le menu `⋮` en session de mémorisation
- Elle est également accessible depuis la liste des cartes sur la page du deck
- Une carte vérifiée peut être re-marquée non vérifiée (ex : si le contenu du cours a changé)

---

### US-6 — Voir en un coup d'œil combien de cartes d'un deck restent à vérifier

**En tant qu'** utilisateur qui a généré un deck entier par IA,
**je veux** voir le nombre de cartes non validées sur la page du deck,
**afin de** savoir l'effort de relecture qu'il me reste à faire avant de commencer à mémoriser.

**Critères d'acceptation :**
- La page du deck affiche un compteur "X cartes à vérifier" si des cartes non validées existent
- Le compteur disparaît quand toutes les cartes sont validées
- Un lien rapide depuis ce compteur filtre la liste sur les cartes non validées uniquement
