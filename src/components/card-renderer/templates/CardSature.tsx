import type { TemplateProps } from '../CardRenderer'

export default function CardSature({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  const stripeSize = isThumb ? '5px' : isFull ? '24px' : '10px'

  return (
    <div
      className="h-full w-full relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: accentColor }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent ${stripeSize},
            rgba(0,0,0,0.18) ${stripeSize},
            rgba(0,0,0,0.18) calc(${stripeSize} * 2)
          )`,
        }}
      />
      <div
        className={`absolute bottom-0 right-0 bg-black/25 ${
          isThumb ? 'w-6 h-6' : isFull ? 'w-24 h-24' : 'w-12 h-12'
        }`}
      />
      <p
        className={`relative z-10 text-white font-black text-center leading-tight ${
          isThumb ? 'text-[7px] px-2' : isFull ? 'text-4xl px-8' : 'text-[12px] px-4'
        }`}
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
      >
        {notion}
      </p>
    </div>
  )
}
