import type { TemplateProps } from '../CardRenderer'

export default function CardMagazine({ notion, size, accentColor = '#C68A3A' }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: '#1A1814' }}
    >
      <div className={isThumb ? 'p-1.5' : isFull ? 'p-7' : 'p-3'}>
        <div
          className={`${isThumb ? 'mt-1 pt-1' : isFull ? 'mt-[22px] pt-4' : 'mt-1.5 pt-1.5'}`}
          style={{ borderTop: `1px solid ${accentColor}` }}
        >
          <p
            className={`font-semibold leading-tight ${
              isThumb ? 'text-[6px]' : isFull ? 'text-[24px]' : 'text-[10px]'
            }`}
            style={{ fontFamily: "var(--font-spectral), serif", color: '#FBF9F4', letterSpacing: '-0.4px' }}
          >
            {notion}
          </p>
        </div>
      </div>

      <div className={`${isThumb ? 'px-1.5 pb-1.5' : isFull ? 'px-7 pb-6' : 'px-3 pb-3'}`}>
        <p
          className={`italic ${isThumb ? 'text-[4px]' : isFull ? 'text-[13px]' : 'text-[7px]'}`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#6B6356' }}
        >
          — à retenir
        </p>
      </div>
    </div>
  )
}
