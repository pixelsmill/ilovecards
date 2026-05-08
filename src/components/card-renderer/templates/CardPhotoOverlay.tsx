import type { TemplateProps } from '../CardRenderer'

export default function CardPhotoOverlay({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full relative flex flex-col justify-end overflow-hidden"
      style={{ backgroundColor: accentColor }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.72) 100%)' }}
      />

      <div
        className="absolute rounded-full opacity-15"
        style={{
          top: '10%',
          right: '8%',
          width: isThumb ? '38px' : isFull ? '180px' : '72px',
          height: isThumb ? '38px' : isFull ? '180px' : '72px',
          backgroundColor: 'white',
        }}
      />

      <div className={`relative z-10 ${isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-3'}`}>
        <p
          className={`text-white font-bold leading-tight ${
            isThumb ? 'text-[6px]' : isFull ? 'text-3xl' : 'text-[11px]'
          }`}
        >
          {notion}
        </p>
      </div>
    </div>
  )
}
