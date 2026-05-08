import type { TemplateProps } from '../CardRenderer'

export default function CardMinimaliste({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 38%, ${accentColor}28 0%, ${accentColor}55 100%),
                     linear-gradient(160deg, #F0EBE0 0%, #DDD5C5 100%)`,
      }}
    >
      <div className={`text-center ${isThumb ? 'px-2' : isFull ? 'px-10' : 'px-5'}`}>
        <p
          className={`leading-snug font-light ${
            isThumb ? 'text-[6px]' : isFull ? 'text-[28px]' : 'text-[11px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#1A1814', letterSpacing: '-0.5px' }}
        >
          {notion}
        </p>
        <div
          className={`rounded-full mx-auto ${isThumb ? 'w-[3px] h-[3px] mt-1' : isFull ? 'w-[5px] h-[5px] mt-6' : 'w-1 h-1 mt-2.5'}`}
          style={{ backgroundColor: accentColor, opacity: 0.7 }}
        />
      </div>
    </div>
  )
}
