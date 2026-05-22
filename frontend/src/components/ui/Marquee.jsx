const ITEMS = [
  'НОВІ НАДХОДЖЕННЯ',
  'АВТОРСЬКИЙ ВІДБІР',
  'JOLI TONE',
  'FASHION ROOM',
  'ТІЛЬКИ ЖИВІ ПРИМІРКИ',
  'ОДЯГ ДЛЯ КОРОЛЕВ',
]

export default function Marquee({ dark = false }) {
  const text = ITEMS.join('  ·  ') + '  ·  '

  return (
    <div className={`overflow-hidden py-3 ${dark ? 'bg-brand-black text-nude-300' : 'bg-nude-200 text-brand-black'}`}>
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1, 2].map((i) => (
          <span key={i} className="font-sans text-[10px] uppercase tracking-[0.25em] mx-0 flex-shrink-0">
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
