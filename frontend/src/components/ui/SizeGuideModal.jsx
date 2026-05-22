import { X } from 'lucide-react'

const SIZES = [
  { label: 'XS', ua: '36', chest: '80–84', waist: '60–64', hips: '86–90' },
  { label: 'S',  ua: '38', chest: '84–88', waist: '64–68', hips: '90–94' },
  { label: 'M',  ua: '40', chest: '88–92', waist: '68–72', hips: '94–98' },
  { label: 'L',  ua: '42', chest: '92–96', waist: '72–76', hips: '98–102' },
  { label: 'XL', ua: '44', chest: '96–102', waist: '76–82', hips: '102–108' },
  { label: 'XXL',ua: '46', chest: '102–110',waist: '82–90', hips: '108–116' },
]

export default function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-nude-100">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-brand-black/40 mb-0.5">Joli Tone</p>
            <h3 className="font-sans text-[18px] font-semibold tracking-[0.05em]">Таблиця розмірів</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-nude-100 flex items-center justify-center hover:bg-nude-200 transition-colors"
          >
            <X size={15} className="text-brand-black" />
          </button>
        </div>

        <div className="px-7 py-6">
          <p className="font-sans text-[13px] text-brand-black/50 mb-5 leading-relaxed">
            Усі виміри в сантиметрах. Якщо ваші параметри між розмірами — беріть більший.
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-nude-200">
                  <th className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 py-2.5 pr-5">Розмір</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 py-2.5 pr-5">UA</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 py-2.5 pr-5">Груди</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 py-2.5 pr-5">Талія</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 py-2.5">Стегна</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nude-100">
                {SIZES.map((s, i) => (
                  <tr
                    key={s.label}
                    className={`transition-colors ${i % 2 === 0 ? 'bg-nude-50/40' : 'bg-white'}`}
                  >
                    <td className="font-sans text-[15px] font-bold text-brand-black py-3 pr-5">{s.label}</td>
                    <td className="font-sans text-[14px] text-brand-black/50 py-3 pr-5">{s.ua}</td>
                    <td className="font-sans text-[14px] text-brand-black py-3 pr-5">{s.chest}</td>
                    <td className="font-sans text-[14px] text-brand-black py-3 pr-5">{s.waist}</td>
                    <td className="font-sans text-[14px] text-brand-black py-3">{s.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to measure */}
          <div className="mt-6 space-y-2.5 border-t border-nude-100 pt-5">
            <p className="font-sans text-[11px] uppercase tracking-widest text-brand-black/40 mb-3">Як виміряти</p>
            {[
              ['Груди', 'Найширша частина грудей, під пахвами. Стрічка паралельна підлозі.'],
              ['Талія', 'Найвужча частина тулуба. Зазвичай 2–3 см вище пупка.'],
              ['Стегна', 'Найширша частина нижче талії. Стрічка паралельна підлозі.'],
            ].map(([part, desc]) => (
              <div key={part} className="flex gap-3">
                <span className="font-sans text-[13px] font-semibold text-brand-black w-14 flex-shrink-0">{part}</span>
                <span className="font-sans text-[13px] text-brand-black/50 leading-snug">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
