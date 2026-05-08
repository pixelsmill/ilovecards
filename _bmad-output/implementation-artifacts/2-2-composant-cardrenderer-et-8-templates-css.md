# Story 2.2 : Composant CardRenderer & 8 templates CSS

Status: done

## Story

En tant qu'utilisateur,
je veux que mes cartes soient rendues avec des templates visuellement distincts,
afin que chaque template active une mémoire visuelle différente et que l'esthétique soit immédiatement attractive.

## Acceptance Criteria

1. `<CardRenderer>` reçoit `card` + `size='thumb'` → rendu miniature (72×112px, ratio 9/14)
2. `<CardRenderer>` reçoit `card` + `size='preview'` → rendu taille moyenne (180×280px)
3. `<CardRenderer>` reçoit `card` + `size='full'` → rendu plein écran (85svh, ratio 9/14)
4. Les 8 templates (poster, quote, magazine, color-block, photo-overlay, minimaliste, equation, sature) sont visuellement distincts — layout, typographie et traitement des couleurs différents
5. La prop `flipped=true` déclenche `transform: rotateY(180deg)` à 60fps avec `backface-visibility: hidden`
6. Sur mobile (full), la carte occupe ~85% hauteur écran avec ratio ~9/14
7. La face verso (CardBack) affiche `developpement` + `source` sur fond zinc-950
8. Un template inconnu (non listé) fallback sur CardMinimaliste

## Tasks / Subtasks

- [x] Créer `src/components/card-renderer/card-renderer.css`
  - [x] Size variants (thumb, preview, full) avec aspect ratio 9/14
  - [x] Flip animation 3D : perspective, transform-style, backface-visibility, will-change
  - [x] Classes .card-renderer, .card-inner, .card-inner.flipped, .card-face, .card-back

- [x] Créer `src/components/card-renderer/CardRenderer.tsx`
  - [x] Props : card (notion, developpement, source, template), size, flipped, accentColor, className
  - [x] Dispatch vers le bon template selon card.template
  - [x] Fallback sur CardMinimaliste si template inconnu
  - [x] Exporter types CardSize, CardData, TemplateProps

- [x] Créer `src/components/card-renderer/CardBack.tsx`
  - [x] Fond zinc-950, barre accent couleur, notion en label, developpement en blanc, source

- [x] Créer les 8 templates dans `src/components/card-renderer/templates/`
  - [x] CardMinimaliste — fond blanc, barre top accent, notion centré
  - [x] CardPoster — fond plein accentColor, texte blanc uppercase bold
  - [x] CardQuote — fond zinc-50, guillemet décoratif, notion en italique
  - [x] CardMagazine — header accent, bordure gauche, notion en headline
  - [x] CardColorBlock — split 45%/55% couleur+blanc, notion en blanc dans top
  - [x] CardPhotoOverlay — fond accentColor + dégradé sombre, notion en bas
  - [x] CardEquation — fond zinc-950, monospace, texte accentColor, style terminal
  - [x] CardSature — fond accentColor, rayures diagonales, notion bold

- [x] Mettre à jour sprint-status.yaml (2-2 → done)

## Dev Notes

### Structure de fichiers

```
src/components/card-renderer/
  CardRenderer.tsx     ← composant principal, dispatch templates
  CardBack.tsx         ← verso partagé par tous les templates
  card-renderer.css    ← flip 3D, size variants
  templates/
    CardMinimaliste.tsx
    CardPoster.tsx
    CardQuote.tsx
    CardMagazine.tsx
    CardColorBlock.tsx
    CardPhotoOverlay.tsx
    CardEquation.tsx
    CardSature.tsx
```

### Types exportés depuis CardRenderer.tsx

```typescript
export type CardSize = 'thumb' | 'preview' | 'full'

export interface CardData {
  notion: string
  developpement?: string | null
  source?: string | null
  template: string
}

export interface TemplateProps {
  notion: string
  accentColor: string
  size: CardSize
}
```

### CSS flip pattern (iOS Safari + Android Chrome)

```css
.card-inner {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
.card-face, .card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-back { transform: rotateY(180deg); }
.card-inner.flipped { transform: rotateY(180deg); }
```

### Sizes

- thumb: 72×112px
- preview: 180×280px
- full: 85svh × min(85svh * 9/14, 100vw-2rem)

### Règle critique (architecture)

`<CardRenderer>` est le seul composant autorisé à rendre un template — pas de rendu inline ailleurs.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- 8 templates créés avec styles visuellement distincts via accentColor prop + Tailwind classes
- CardBack fond zinc-950 partagé par tous les templates (verso de la flashcard)
- CSS flip animation avec vendor prefixes pour iOS Safari
- Fallback CardMinimaliste si card.template non reconnu
- Aucun "use client" requis sur CardRenderer lui-même — composant serveur pur

### File List

- src/components/card-renderer/card-renderer.css
- src/components/card-renderer/CardRenderer.tsx
- src/components/card-renderer/CardBack.tsx
- src/components/card-renderer/templates/CardMinimaliste.tsx
- src/components/card-renderer/templates/CardPoster.tsx
- src/components/card-renderer/templates/CardQuote.tsx
- src/components/card-renderer/templates/CardMagazine.tsx
- src/components/card-renderer/templates/CardColorBlock.tsx
- src/components/card-renderer/templates/CardPhotoOverlay.tsx
- src/components/card-renderer/templates/CardEquation.tsx
- src/components/card-renderer/templates/CardSature.tsx

### Change Log

- Created CardRenderer component and 8 CSS templates (Date: 2026-05-08)
