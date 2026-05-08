import type { TemplateProps } from '../CardRenderer'

export default function CardMinimaliste({ notion, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ background: 'radial-gradient(circle at 50% 40%, #E8EEDA 0%, #C9D4B8 100%)' }}
    >
      <div className={`text-center ${isThumb ? 'px-2' : isFull ? 'px-10' : 'px-5'}`}>
        <p
          className={`leading-snug font-light ${
            isThumb ? 'text-[6px]' : isFull ? 'text-[28px]' : 'text-[11px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#2C3522', letterSpacing: '-0.5px' }}
        >
          {notion}
        </p>
        <div
          className={`rounded-full mx-auto ${isThumb ? 'w-[3px] h-[3px] mt-1' : isFull ? 'w-[5px] h-[5px] mt-6' : 'w-1 h-1 mt-2.5'}`}
          style={{ backgroundColor: '#2C3522', opacity: 0.35 }}
        />
      </div>
    </div>
  )
}
