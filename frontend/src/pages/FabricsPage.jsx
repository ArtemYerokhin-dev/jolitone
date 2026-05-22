const FABRICS = [
  {
    name: 'Віскоза',
    desc: 'Штучна, але відчувається краще за шовк — не накопичує тепло, не електризується. Оптимальна для суконь і легких комплектів.',
    props: ['Дихає', 'Гіпоалергенна', 'Добре драпірується'],
  },
  {
    name: 'Поліестер',
    desc: 'Тримає форму після сотень прань. Не розтягується, колір не вицвітає, майже не потребує прасування.',
    props: ['Не деформується', 'Швидко сохне', 'Стійкий колір'],
  },
  {
    name: 'Поліамід',
    desc: 'Найлегший серед синтетики. Тонкий, але міцний — тому і незамінний у підкладках та еластичних виробах.',
    props: ['Ультралегкий', 'Міцний', 'Гнучкий'],
  },
  {
    name: 'Акрил',
    desc: 'Виглядає як вовна, але не коле, не сідає і не потребує ручного прання. Тримає тепло навіть вологим.',
    props: ['Не коле', 'Не сідає', 'Легкий догляд'],
  },
  {
    name: 'Льон',
    desc: 'Охолоджує на кілька градусів відносно повітря. З кожним пранням стає м\'якшим і натуральнішим на дотик.',
    props: ['Охолоджує', 'М\'якшає з часом', 'Міцний'],
  },
  {
    name: 'Еластан',
    desc: 'Ніколи не використовується самостійно. 5% у складі — і річ тягнеться, повертає форму, не тисне.',
    props: ['Свобода руху', 'Тримає силует', 'Додається до суміші'],
  },
]

export default function FabricsPage() {
  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="px-8 md:px-16 pt-10 pb-8 border-b border-nude-200">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-brand-black/35 mb-2">
          Матеріали
        </p>
        <h1 className="font-sans text-3xl md:text-4xl font-light tracking-[0.04em] text-brand-black mb-5">
          Тканини
        </h1>
        <p className="font-sans text-[15px] font-light text-brand-black/70 max-w-lg leading-relaxed">
          Кожен матеріал обраний з конкретної причини — не лише за виглядом, а за тим, як поводиться на тілі та з часом.
        </p>
      </div>

      {/* ── Fabric entries ── */}
      <div className="px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-0">
        {FABRICS.map((f, i) => (
          <div
            key={f.name}
            className={`py-8 border-b border-nude-200 ${
              i % 2 === 0 ? 'md:border-r md:pr-16' : 'md:pl-4'
            }`}
          >
            <h2 className="font-sans text-[20px] font-light tracking-[0.05em] text-brand-black mb-2.5">
              {f.name}
            </h2>
            <p className="font-sans text-[13.5px] leading-relaxed text-brand-black/75 mb-4">
              {f.desc}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {f.props.map(p => (
                <span
                  key={p}
                  className="font-sans text-[10.5px] uppercase tracking-[0.15em] text-brand-black/55 border border-nude-300 px-2.5 py-1"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div className="px-8 md:px-16 pb-16">
        <p className="font-sans text-[12px] text-brand-black/50 leading-relaxed max-w-md">
          Склад кожного виробу вказано в описі товару. Якщо є чутливість до певних матеріалів — напишіть у{' '}
          <a
            href="https://www.instagram.com/joli_tone_ua"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-black/50 transition-colors"
          >
            Instagram
          </a>{' '}
          перед замовленням.
        </p>
      </div>
    </div>
  )
}
