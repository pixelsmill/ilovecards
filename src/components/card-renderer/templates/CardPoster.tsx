import type { TemplateProps } from '../CardRenderer'

export default function CardPoster({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: accentColor }}
    >
      <div className={`absolute left-1/2 -translate-x-1/2 bg-white/40 ${
        isThumb ? 'top-1.5 w-4 h-px' : isFull ? 'top-6 w-8 h-0.5' : 'top-3 w-6 h-px'
      }`} />
      <p
        className={`text-center font-bold leading-tight ${
          isThumb ? 'text-[7px] px-2' : isFull ? 'text-[28px] px-8' : 'text-[12px] px-4'
        }`}
        style={{ fontFamily: "var(--font-spectral), serif", color: '#FFF8F0', letterSpacing: '-0.5px' }}
      >
        {notion}
      </p>
    </div>
  )
}
