// Відгуки — доступні через посилання у футері

const MOCK_REVIEWS = [
  {
    id: 1,
    author: 'Олена К.',
    text: 'Неймовірна якість! Блуза виглядає точно як на фото, тканина приємна. Дуже задоволена покупкою.',
    product: 'Блуза шовкова',
    date: '2024-11',
  },
  {
    id: 2,
    author: 'Марія Т.',
    text: 'Замовляла костюм — прийшов швидко, сидить ідеально. Буду замовляти ще!',
    product: 'Костюм класичний',
    date: '2024-12',
  },
  {
    id: 3,
    author: 'Ірина В.',
    text: 'Живі примірки — це те, що мене зацікавило. Сукня сидить як рідна, відповідає розміру.',
    product: 'Сукня міді',
    date: '2025-01',
  },
]

export default function ReviewsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
      <div className="mb-12 text-center">
        <p className="font-sans text-[12px] uppercase tracking-[0.2em] text-brand-black mb-3">Враження покупців</p>
        <h1 className="font-sans text-6xl font-light tracking-[0.04em]">Відгуки</h1>
        <p className="mt-4 font-sans text-sm text-brand-black">
          Залиш відгук або відмітку в Instagram — отримай -5% на наступну покупку
        </p>
      </div>

      <div className="space-y-6">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-white border border-nude-200 p-6">
            <p className="font-sans text-lg leading-relaxed text-brand-black">
              «{review.text}»
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-sans text-sm font-medium text-brand-black">{review.author}</p>
                <p className="font-sans text-xs text-brand-black">{review.product}</p>
              </div>
              <p className="font-sans text-xs text-brand-black">{review.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center border-t border-nude-200 pt-12">
        <p className="font-sans text-sm text-brand-black mb-4">
          Поділіться своїм враженням:
        </p>
        <a
          href="https://www.instagram.com/joli_tone_ua"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand-black text-nude-50 px-8 py-3.5 font-sans text-xs uppercase tracking-widest hover:bg-nude-700 transition-colors"
        >
          Написати в Instagram
        </a>
      </div>
    </div>
  )
}
