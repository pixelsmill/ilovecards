import type { TemplateProps } from '../CardRenderer'

export default function CardMagazine({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full bg-white flex flex-col overflow-hidden">
      <div
        className={`flex-shrink-0 flex items-center ${isThumb ? 'px-1.5 py-1' : isFull ? 'px-6 py-3' : 'px-3 py-1.5'}`}
        style={{ backgroundColor: accentColor }}
      >
        <span
          className={`text-white font-bold uppercase tracking-widest ${
            isThumb ? 'text-[4px]' : isFull ? 'text-xs' : 'text-[6px]'
          }`}
        >
          NOTE
        </span>
      </div>

      <div className={`flex flex-1 overflow-hidden ${isThumb ? 'p-1.5' : isFull ? 'p-6' : 'p-3'}`}>
        <div
          className={`flex-shrink-0 self-stretch rounded-full ${isThumb ? 'w-[2px] mr-1.5' : isFull ? 'w-1 mr-5' : 'w-[2px] mr-2.5'}`}
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex flex-1 items-center overflow-hidden">
          <p
            className={`text-zinc-900 font-bold leading-tight ${
              isThumb ? 'text-[6px]' : isFull ? 'text-3xl' : 'text-[11px]'
            }`}
          >
            {notion}
          </p>
        </div>
      </div>
    </div>
  )
}
