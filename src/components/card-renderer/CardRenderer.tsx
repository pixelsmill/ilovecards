import './card-renderer.css'
import CardPoster from './templates/CardPoster'
import CardQuote from './templates/CardQuote'
import CardMagazine from './templates/CardMagazine'
import CardColorBlock from './templates/CardColorBlock'
import CardPhotoOverlay from './templates/CardPhotoOverlay'
import CardMinimaliste from './templates/CardMinimaliste'
import CardEquation from './templates/CardEquation'
import CardSature from './templates/CardSature'
import CardBack from './CardBack'

export type CardSize = 'thumb' | 'preview' | 'full'

export interface CardData {
  notion: string
  developpement?: string | null
  source?: string | null
  template: string
  imageUrl?: string | null
  verified?: boolean | null
}

export interface TemplateProps {
  notion: string
  accentColor: string
  size: CardSize
  imageUrl?: string
}

const TEMPLATES: Record<string, React.ComponentType<TemplateProps>> = {
  poster: CardPoster,
  quote: CardQuote,
  magazine: CardMagazine,
  'color-block': CardColorBlock,
  'photo-overlay': CardPhotoOverlay,
  minimaliste: CardMinimaliste,
  equation: CardEquation,
  sature: CardSature,
}

interface Props {
  card: CardData
  size: CardSize
  flipped?: boolean
  accentColor?: string
  deckName?: string
  className?: string
}

const LIGHT_TEMPLATES = new Set(['quote', 'minimaliste'])

export default function CardRenderer({ card, size, flipped = false, accentColor = '#6366f1', deckName, className }: Props) {
  const TemplateComponent = TEMPLATES[card.template] ?? CardMinimaliste
  const showLabel = deckName && size !== 'thumb'
  const isVerified = card.verified !== false
  const labelColor = LIGHT_TEMPLATES.has(card.template) ? '#1A1814' : '#ffffff'

  return (
    <div className={`card-renderer card-renderer--${size}${className ? ' ' + className : ''}`}>
      <div className={`card-inner${flipped ? ' flipped' : ''}`}>
        <div className="card-face">
          <TemplateComponent notion={card.notion} accentColor={accentColor} size={size} imageUrl={card.imageUrl ?? undefined} />
          {showLabel && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none select-none">
              <div
                className={`rounded-full flex-shrink-0 ${size === 'full' ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`}
                style={isVerified
                  ? { backgroundColor: labelColor }
                  : { border: `2px solid ${labelColor}`, backgroundColor: 'transparent' }
                }
              />
              <span
                className={`uppercase tracking-widest truncate ${size === 'full' ? 'text-[10px]' : 'text-[5px]'}`}
                style={{ fontWeight: 500, color: labelColor }}
              >
                {deckName}
              </span>
            </div>
          )}
        </div>
        <div className="card-back">
          <CardBack
            notion={card.notion}
            developpement={card.developpement}
            source={card.source}
            accentColor={accentColor}
            deckName={deckName}
            size={size}
            verified={card.verified}
          />
        </div>
      </div>
    </div>
  )
}
