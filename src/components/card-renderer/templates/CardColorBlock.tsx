import type { TemplateProps } from '../CardRenderer'

export default function CardColorBlock({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div
        className={`flex items-center justify-center ${isThumb ? 'px-2' : isFull ? 'px-8' : 'px-4'}`}
        style={{ backgroundColor: accentColor, height: '45%' }}
      >
        <p
          className={`text-white font-semibold text-center leading-tight ${
            isThumb ? 'text-[6px]' : isFull ? 'text-2xl' : 'text-[10px]'
          }`}
        >
          {notion}
        </p>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center">
        <div
          className={`rounded-full ${isThumb ? 'w-3 h-3' : isFull ? 'w-10 h-10' : 'w-5 h-5'}`}
          style={{ backgroundColor: accentColor, opacity: 0.18 }}
        />
      </div>
    </div>
  )
}
