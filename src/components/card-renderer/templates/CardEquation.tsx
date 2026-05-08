import type { TemplateProps } from '../CardRenderer'

export default function CardEquation({ notion, size }: TemplateProps) {
  const isThumb = size === 'thumb'
  const isFull = size === 'full'

  return (
    <div
      className="h-full w-full flex flex-col justify-center overflow-hidden"
      style={{ backgroundColor: '#F8F5EE', color: '#1A1814' }}
    >
      <div className={isThumb ? 'p-1.5' : isFull ? 'p-8' : 'p-4'}>
        <div
          className={`text-center leading-relaxed ${
            isThumb ? 'text-[5px] p-1 rounded' : isFull ? 'text-lg p-5 rounded-lg' : 'text-[8px] p-2 rounded-md'
          }`}
          style={{
            fontFamily: "var(--font-jetbrains-mono), 'Courier New', monospace",
            border: `${isThumb ? '1px' : '1.5px'} solid #1A1814`,
            backgroundColor: '#FBF9F4',
          }}
        >
          {notion}
        </div>
        <p
          className={`text-center italic mt-3 ${isThumb ? 'text-[4px] mt-1' : isFull ? 'text-sm' : 'text-[7px] mt-1.5'}`}
          style={{ fontFamily: "var(--font-spectral), serif", color: '#6B6356', letterSpacing: '0.3px' }}
        >
          définition
        </p>
      </div>
    </div>
  )
}
