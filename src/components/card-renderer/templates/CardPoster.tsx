import type { TemplateProps } from '../CardRenderer'

export default function CardPoster({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ backgroundColor: accentColor }}
    >
      <p
        className={`text-white font-black uppercase tracking-wider text-center leading-tight ${
          isThumb ? 'text-[7px] px-2' : isFull ? 'text-4xl px-8' : 'text-[12px] px-4'
        }`}
      >
        {notion}
      </p>
    </div>
  )
}
