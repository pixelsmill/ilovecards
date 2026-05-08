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
}

export interface TemplateProps {
  notion: string
  accentColor: string
  size: CardSize
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

export default function CardRenderer({ card, size, flipped = false, accentColor = '#6366f1', deckName, className }: Props) {
  const TemplateComponent = TEMPLATES[card.template] ?? CardMinimaliste
  const showLabel = deckName && size !== 'thumb'

  return (
    <div className={`card-renderer card-renderer--${size}${className ? ' ' + className : ''}`}>
      <div className={`card-inner${flipped ? ' flipped' : ''}`}>
        <div className="card-face">
          <TemplateComponent notion={card.notion} accentColor={accentColor} size={size} />
          {showLabel && (
            <div
              className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full pointer-events-none select-none"
              style={{
                background: 'rgba(0,0,0,0.28)',
                backdropFilter: 'blur(6px)',
                padding: size === 'full' ? '4px 10px' : '2px 7px',
              }}
            >
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  backgroundColor: accentColor,
                  width: size === 'full' ? '6px' : '4px',
                  height: size === 'full' ? '6px' : '4px',
                }}
              />
              <span
                className="text-white font-medium tracking-wide truncate max-w-[120px]"
                style={{ fontSize: size === 'full' ? '10px' : '7px' }}
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
          />
        </div>
      </div>
    </div>
  )
}
