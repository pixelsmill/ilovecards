import type { TemplateProps } from '../CardRenderer'

export default function CardQuote({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full bg-zinc-50 relative flex flex-col justify-center overflow-hidden">
      <span
        className={`absolute font-serif font-bold leading-none select-none pointer-events-none ${
          isThumb ? 'text-[28px] top-[-4px] left-1' : isFull ? 'text-[180px] top-[-20px] left-4' : 'text-[72px] top-[-8px] left-2'
        }`}
        style={{ color: accentColor, opacity: 0.35 }}
        aria-hidden
      >
        &ldquo;
      </span>

      <div className={`relative z-10 ${isThumb ? 'px-2 pb-2 pt-5' : isFull ? 'px-10 pb-8 pt-16' : 'px-4 pb-4 pt-8'}`}>
        <p
          className={`text-zinc-800 italic leading-snug font-medium ${
            isThumb ? 'text-[6px]' : isFull ? 'text-2xl' : 'text-[10px]'
          }`}
        >
          {notion}
        </p>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 ${isThumb ? 'h-[2px]' : 'h-[3px]'}`}
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}
