import type { TemplateProps } from '../CardRenderer'

export default function CardEquation({ notion, accentColor, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col justify-center overflow-hidden">
      <div className={isThumb ? 'p-2' : isFull ? 'p-8' : 'p-4'}>
        <p
          className={`font-mono text-zinc-600 ${
            isThumb ? 'text-[4px] mb-0.5' : isFull ? 'text-sm mb-3' : 'text-[7px] mb-1'
          }`}
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          {'> '}define
        </p>
        <p
          className={`font-mono font-bold leading-snug break-words ${
            isThumb ? 'text-[6px]' : isFull ? 'text-2xl' : 'text-[10px]'
          }`}
          style={{ color: accentColor, fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          {notion}
        </p>
        <span
          className={`inline-block bg-zinc-600 ml-0.5 animate-pulse ${
            isThumb ? 'w-[1.5px] h-[5px]' : isFull ? 'w-[3px] h-6' : 'w-[2px] h-[9px]'
          }`}
        />
      </div>
    </div>
  )
}
