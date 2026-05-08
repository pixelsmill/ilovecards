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
  className?: string
}

export default function CardRenderer({ card, size, flipped = false, accentColor = '#6366f1', className }: Props) {
  const TemplateComponent = TEMPLATES[card.template] ?? CardMinimaliste

  return (
    <div className={`card-renderer card-renderer--${size}${className ? ' ' + className : ''}`}>
      <div className={`card-inner${flipped ? ' flipped' : ''}`}>
        <div className="card-face">
          <TemplateComponent notion={card.notion} accentColor={accentColor} size={size} />
        </div>
        <div className="card-back">
          <CardBack
            notion={card.notion}
            developpement={card.developpement}
            source={card.source}
            accentColor={accentColor}
            size={size}
          />
        </div>
      </div>
    </div>
  )
}
