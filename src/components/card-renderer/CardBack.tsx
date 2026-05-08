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
    <div className="h-full w-full bg-white flex flex-col">
      <div className="flex-shrink-0" style={{ backgroundColor: accentColor, height: isThumb ? '2px' : '3px' }} />

      <div className={`flex flex-col flex-1 overflow-hidden ${isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-3'}`}>
        <p className={`text-zinc-400 font-medium truncate ${isThumb ? 'text-[4px]' : isFull ? 'text-xs' : 'text-[7px]'}`}>
          {notion}
        </p>

        <div className={`flex-shrink-0 border-t border-zinc-200 ${isThumb ? 'my-1' : isFull ? 'my-4' : 'my-1.5'}`} />

        <div className="flex-1 overflow-hidden">
          {developpement ? (
            <p className={`text-zinc-900 leading-relaxed ${isThumb ? 'text-[5px] leading-tight' : isFull ? 'text-xl' : 'text-[9px]'}`}>
              {developpement}
            </p>
          ) : (
            <p className={`text-zinc-400 italic ${isThumb ? 'text-[4px]' : isFull ? 'text-sm' : 'text-[7px]'}`}>
              Aucune explication
            </p>
          )}
        </div>

        {source && !isThumb && (
          <p className={`text-zinc-400 truncate flex-shrink-0 ${isFull ? 'text-xs mt-4' : 'text-[6px] mt-1.5'}`}>
            — {source}
          </p>
        )}
      </div>
    </div>
  )
}
