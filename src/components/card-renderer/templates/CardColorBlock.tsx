import type { TemplateProps } from '../CardRenderer'

export default function CardColorBlock({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div
        className={`flex items-end ${isThumb ? 'px-1.5 pb-1.5 pt-2' : isFull ? 'px-7 pb-6 pt-8' : 'px-3 pb-3 pt-4'}`}
        style={{ backgroundColor: accentColor, flex: '1.2' }}
      >
        <p
          className={`text-white font-extrabold leading-none ${
            isThumb ? 'text-[7px]' : isFull ? 'text-[32px]' : 'text-[13px]'
          }`}
          style={{ fontFamily: "var(--font-spectral), serif", letterSpacing: '-1px' }}
        >
          {notion}
        </p>
      </div>

      <div
        className={`flex items-center ${isThumb ? 'px-1.5 py-1' : isFull ? 'px-7 py-5' : 'px-3 py-2.5'}`}
        style={{ backgroundColor: '#F5EFE2', flex: '1' }}
      >
        <div
          className={`rounded-full flex-shrink-0 ${isThumb ? 'w-1 h-1' : isFull ? 'w-3 h-3' : 'w-1.5 h-1.5'}`}
          style={{ backgroundColor: accentColor, opacity: 0.5 }}
        />
      </div>
    </div>
  )
}
