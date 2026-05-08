import type { TemplateProps } from '../CardRenderer'

export default function CardPhotoOverlay({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full relative flex flex-col justify-end overflow-hidden"
      style={{ backgroundColor: accentColor }}
    >
      {/* Abstract landscape layers */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(160deg, color-mix(in srgb, ${accentColor} 60%, white 40%) 0%, ${accentColor} 45%, color-mix(in srgb, ${accentColor} 70%, black 30%) 100%)`,
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)',
      }} />
      {/* Ground shadow gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.80) 100%)',
      }} />

      <div className={`relative z-10 ${isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-3'}`}>
        <p
          className={`text-white font-semibold leading-tight ${
            isThumb ? 'text-[6px]' : isFull ? 'text-[26px]' : 'text-[10px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", letterSpacing: '-0.3px', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
        >
          {notion}
        </p>
      </div>
    </div>
  )
}
