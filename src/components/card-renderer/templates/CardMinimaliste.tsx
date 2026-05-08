import type { TemplateProps } from '../CardRenderer'

export default function CardMinimaliste({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full bg-white relative flex flex-col items-center justify-center">
      <div
        className="absolute top-0 left-0 right-0"
        style={{ backgroundColor: accentColor, height: isThumb ? '2px' : isFull ? '4px' : '3px' }}
      />

      <div className={`text-center ${isThumb ? 'px-2' : isFull ? 'px-10' : 'px-5'}`}>
        <p
          className={`text-zinc-800 font-medium leading-snug ${
            isThumb ? 'text-[6px]' : isFull ? 'text-2xl' : 'text-[11px]'
          }`}
        >
          {notion}
        </p>
        <div
          className={`mx-auto rounded-full ${isThumb ? 'w-[3px] h-[3px] mt-1' : isFull ? 'w-2 h-2 mt-5' : 'w-1 h-1 mt-2.5'}`}
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  )
}
