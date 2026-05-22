// Початкові mock-замовлення — відображаються якщо localStorage порожній
export const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '2025-10-05',
    customer: { name: 'Олена Ковальчук', phone: '+380671234567', city: 'Київ, НП №14' },
    items: [
      { id: '1',  name: 'Сукня з відкритими плечима', color: 'Коричневий', size: 'S', qty: 1, price: 1850 },
    ],
    total: 1850,
    delivery: 'nova_poshta',
    status: 'completed',
    comment: '',
  },
  {
    id: 'ORD-002',
    date: '2025-11-12',
    customer: { name: 'Марія Ткаченко', phone: '+380501112233', city: 'Одеса, НП №3' },
    items: [
      { id: '6',  name: 'Кремовий кардиган', color: '', size: 'M', qty: 1, price: 1750 },
      { id: '12', name: 'Поло аргайл', color: 'Коричневий', size: 'S', qty: 1, price: 1200 },
    ],
    total: 2950,
    delivery: 'nova_poshta',
    status: 'completed',
    comment: '',
  },
  {
    id: 'ORD-003',
    date: '2025-12-01',
    customer: { name: 'Ірина Василенко', phone: '+380632223344', city: 'Харків, НП №8' },
    items: [
      { id: '8',  name: 'Костюм на блискавці', color: 'Білий', size: 'M', qty: 1, price: 3100 },
    ],
    total: 3100,
    delivery: 'nova_poshta',
    status: 'shipped',
    comment: 'Прошу упакувати в подарунок',
  },
  {
    id: 'ORD-004',
    date: '2026-01-08',
    customer: { name: 'Наталія Мороз', phone: '+380997778899', city: 'Львів, НП №2' },
    items: [
      { id: '5',  name: 'Чорна сукня з мереживом міді', color: '', size: 'XS', qty: 1, price: 2950 },
      { id: '19', name: 'Футболка з мереживом', color: 'Чорний', size: 'S', qty: 2, price: 950 },
    ],
    total: 4850,
    delivery: 'nova_poshta',
    status: 'completed',
    comment: '',
  },
  {
    id: 'ORD-005',
    date: '2026-02-14',
    customer: { name: 'Юлія Бондаренко', phone: '+380664445566', city: 'Дніпро, НП №7' },
    items: [
      { id: '22', name: 'Сукня з поясом', color: 'Червоний', size: 'S', qty: 1, price: 2200 },
      { id: '38', name: 'Бежевий светр з перлинами', color: '', size: 'M', qty: 1, price: 2100 },
    ],
    total: 4300,
    delivery: 'nova_poshta',
    status: 'completed',
    comment: 'Валентинів день, прошу швидко',
  },
  {
    id: 'ORD-006',
    date: '2026-03-10',
    customer: { name: 'Катерина Левченко', phone: '+380505556677', city: 'Полтава, НП №1' },
    items: [
      { id: '34', name: 'Сукня-трапеція з кристальним поясом', color: 'Чорний', size: 'M', qty: 1, price: 2650 },
    ],
    total: 2650,
    delivery: 'nova_poshta',
    status: 'processing',
    comment: '',
  },
  {
    id: 'ORD-007',
    date: '2026-04-02',
    customer: { name: 'Аліна Петренко', phone: '+380731234321', city: 'Запоріжжя, НП №9' },
    items: [
      { id: '2',  name: 'Квіткова сукня міді', color: 'Блакитний', size: 'S', qty: 1, price: 2100 },
      { id: '29', name: 'Білий кардиган з мереживом', color: '', size: 'S', qty: 1, price: 1650 },
    ],
    total: 3750,
    delivery: 'nova_poshta',
    status: 'processing',
    comment: '',
  },
  {
    id: 'ORD-008',
    date: '2026-05-05',
    customer: { name: 'Вікторія Шевченко', phone: '+380676667788', city: 'Київ, НП №22' },
    items: [
      { id: '35', name: 'Сукня з пишними рукавами', color: 'Помаранчевий', size: 'M', qty: 1, price: 2400 },
      { id: '26', name: 'Коричнева клітчаста сорочка оверсайз', color: '', size: 'L', qty: 1, price: 1450 },
    ],
    total: 3850,
    delivery: 'nova_poshta',
    status: 'processing',
    comment: 'Дзвоніть перед відправкою',
  },
]

export const STATUS_LABELS = {
  processing: 'Нове',
  shipped:    'Відправлено',
  completed:  'Виконано',
}

export const STATUS_COLORS = {
  processing: 'bg-amber-100 text-amber-800',
  shipped:    'bg-blue-100 text-blue-800',
  completed:  'bg-green-100 text-green-800',
}
