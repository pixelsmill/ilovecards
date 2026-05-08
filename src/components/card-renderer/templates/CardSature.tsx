import type { TemplateProps } from '../CardRenderer'

export default function CardSature({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex flex-col justify-center overflow-hidden"
      style={{ backgroundColor: accentColor }}
    >
      <div className={isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-4'}>
        <p
          className={`uppercase tracking-widest ${isThumb ? 'text-[3px] mb-1' : isFull ? 'text-[10px] mb-5' : 'text-[5px] mb-2'}`}
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: '#FFF8F0', opacity: 0.5 }}
        >
          NOTION
        </p>
        <p
          className={`font-semibold leading-snug ${
            isThumb ? 'text-[6px]' : isFull ? 'text-[24px]' : 'text-[10px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#F0EAD8', letterSpacing: '-0.3px' }}
        >
          {notion}
        </p>
      </div>
    </div>
  )
}
