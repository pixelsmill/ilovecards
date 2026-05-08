import type { CardSize } from './CardRenderer'

interface Props {
  notion: string
  developpement?: string | null
  source?: string | null
  accentColor: string
  size: CardSize
}

export default function CardBack({ notion, developpement, source, accentColor, size }: Props) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: '#FBF9F4', color: '#1A1814' }}
    >
      {/* Top: deck bar + developpement */}
      <div className={`flex flex-col overflow-hidden ${isThumb ? 'p-1.5' : isFull ? 'p-7' : 'p-3'}`}>
        {/* Deck bar */}
        <div className={`flex items-center gap-1.5 flex-shrink-0 ${isThumb ? 'mb-1' : isFull ? 'mb-5' : 'mb-2'}`}>
          <div
            className={`rounded-full flex-shrink-0 ${isThumb ? 'w-1 h-1' : isFull ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'}`}
            style={{ backgroundColor: accentColor }}
          />
          <p
            className={`uppercase tracking-widest truncate ${isThumb ? 'text-[3px]' : isFull ? 'text-[10px]' : 'text-[5px]'}`}
            style={{ color: '#6B6356', fontWeight: 500 }}
          >
            {notion}
          </p>
        </div>

        {/* Divider */}
        <div className={`flex-shrink-0 ${isThumb ? 'mb-1' : isFull ? 'mb-4' : 'mb-2'}`}
             style={{ borderTop: '1px solid rgba(26,24,20,0.1)' }} />

        {/* Developpement */}
        <div className="flex-1 overflow-hidden">
          {developpement ? (
            <p
              className={`leading-relaxed ${isThumb ? 'text-[4px]' : isFull ? 'text-[17px]' : 'text-[8px]'}`}
              style={{ fontFamily: "var(--font-spectral), serif", color: '#1A1814' }}
            >
              {developpement}
            </p>
          ) : (
            <p
              className={`italic ${isThumb ? 'text-[4px]' : isFull ? 'text-sm' : 'text-[7px]'}`}
              style={{ fontFamily: "var(--font-spectral), serif", color: '#6B6356' }}
            >
              Aucune explication
            </p>
          )}
        </div>
      </div>

      {/* Bottom: source */}
      {source && !isThumb && (
        <div
          className={`flex-shrink-0 ${isFull ? 'px-7 pb-6' : 'px-3 pb-3'}`}
          style={{ borderTop: '1px solid rgba(26,24,20,0.08)' }}
        >
          <p
            className={`font-semibold uppercase tracking-widest ${isFull ? 'text-[9px] mt-3 mb-1' : 'text-[5px] mt-1.5 mb-0.5'}`}
            style={{ color: '#C68A3A' }}
          >
            Provenance
          </p>
          <p
            className={`leading-relaxed ${isFull ? 'text-xs' : 'text-[6px]'}`}
            style={{ color: '#6B6356' }}
          >
            {source}
          </p>
        </div>
      )}
    </div>
  )
}
