import type { TemplateProps } from '../CardRenderer'

export default function CardQuote({ notion, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex flex-col justify-between overflow-hidden"
      style={{ backgroundColor: '#F5EFE2', color: '#1A1814' }}
    >
      <div className={isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-3'}>
        <div
          className={`font-bold leading-none select-none pointer-events-none ${
            isThumb ? 'text-[28px] -mt-1 -ml-0.5' : isFull ? 'text-[140px] -mt-4 -ml-2' : 'text-[60px] -mt-2 -ml-1'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#7A2E3A', opacity: 0.85 }}
          aria-hidden
        >
          &ldquo;
        </div>
        <p
          className={`italic leading-snug ${
            isThumb ? 'text-[5px]' : isFull ? 'text-[22px]' : 'text-[9px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif" }}
        >
          {notion}
        </p>
      </div>

      <div className={`${isThumb ? 'px-1.5 pb-1.5' : isFull ? 'px-8 pb-6' : 'px-3 pb-3'}`}>
        <div className="h-px bg-current opacity-10 mb-2" />
        <p className={`uppercase tracking-widest ${isThumb ? 'text-[4px]' : isFull ? 'text-[10px]' : 'text-[6px]'}`}
           style={{ color: '#6B6356' }}>
          Citation
        </p>
      </div>
    </div>
  )
}
