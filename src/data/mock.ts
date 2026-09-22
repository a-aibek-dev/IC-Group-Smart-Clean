import type { Cleaner, Regulation, RegulationItem, TeamCleaner, Zone, ZoneStatus, ZoneType } from '../types'

/**
 * Регламент зоны: КАК это сделать, стандарты и средства.
 * Используется шаблоном, чтобы клинер всегда видел единый SOP.
 */
const regulation = (
  procedure: string[],
  standards: RegulationItem[],
  tools: RegulationItem[],
): Regulation => ({ procedure, standards, tools })

/** Умные шаблоны: система сама красит зону, подтягивает регламент и чек-лист. */
export const zoneTemplates: Record<
  ZoneType,
  {
    label: string
    colorClass: string
    lightColor: string
    text: string
    ph: string
    phValue: number
    inventoryHint: string
    regulation: Regulation
  }
> = {
  blue: {
    label: 'Общие зоны',
    colorClass: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    text: 'text-blue-600',
    ph: '7.0 (Нейтральное средство)',
    phValue: 7,
    inventoryHint: 'Используйте СИНИЙ инвентарь и нейтральное средство',
    regulation: regulation(
      [
        'Подготовьте синий инвентарь и нейтральное средство',
        'Убирайте сверху вниз: поверхности → столы → пол',
        'Обработайте дверные ручки и выключатели влажной ветошью',
        'Пропылесосьте ковролин, затем протрите пол',
        'Проверьте результат по чек-листу, включая скрытые детали',
      ],
      [
        { label: 'Время уборки', value: '20–30 мин' },
        { label: 'Экспозиция средства', value: 'до 3 мин' },
        { label: 'Смена ветоши', value: 'при загрязнении' },
      ],
      [
        { label: 'Химия', value: 'нейтральное средство, pH 7' },
        { label: 'Инвентарь', value: 'синий набор (ведро, ветошь, швабра)' },
        { label: 'СИЗ', value: 'перчатки' },
      ],
    ),
  },
  yellow: {
    label: 'Грязные зоны',
    colorClass: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    text: 'text-yellow-600',
    ph: '4.0 (Кислотная пена)',
    phValue: 4,
    inventoryHint: 'Используйте ЖЁЛТЫЙ инвентарь и кислотную пену',
    regulation: regulation(
      [
        'Нанесите кислотную пену на пол входной группы',
        'Оставьте пену на 3–5 минут для экспозиции',
        'Уберите грязь щёткой и смойте остатки',
        'Опустошите и продезинфицируйте мусорные баки',
        'Обработайте кнопку лифта и домофон',
      ],
      [
        { label: 'Экспозиция пены', value: '3–5 мин' },
        { label: 'Время на зону', value: 'до 20 мин' },
        { label: 'Вынос мусора', value: 'при заполнении 2/3' },
      ],
      [
        { label: 'Химия', value: 'кислотная пена, pH 4' },
        { label: 'Инвентарь', value: 'жёлтый набор (щётка, швабра)' },
        { label: 'СИЗ', value: 'перчатки + непромокаемый фартук' },
      ],
    ),
  },
  red: {
    label: 'Санузлы',
    colorClass: 'bg-red-500',
    lightColor: 'bg-red-50',
    text: 'text-red-600',
    ph: '3.0 (Кислотное средство)',
    phValue: 3,
    inventoryHint: 'Используйте КРАСНЫЙ инвентарь и средство с pH 3.0',
    regulation: regulation(
      [
        'Нанесите кислотное средство на унитаз, раковину и кнопку смыва',
        'Оставьте на экспозицию 5–7 минут',
        'Очистите ёршом и ветошью сверху вниз',
        'Смойте средство и высушите поверхности',
        'Замените бумагу, проверьте диспенсеры и вентиляцию',
      ],
      [
        { label: 'Экспозиция средства', value: '5–7 мин' },
        { label: 'Время на зону', value: 'до 20 мин' },
        { label: 'Кнопка смыва', value: 'обрабатывается всегда' },
      ],
      [
        { label: 'Химия', value: 'кислотное средство, pH 3' },
        { label: 'Инвентарь', value: 'красный набор (ёрш, ветошь)' },
        { label: 'СИЗ', value: 'перчатки + маска' },
      ],
    ),
  },
  green: {
    label: 'Кафетерии',
    colorClass: 'bg-green-500',
    lightColor: 'bg-green-50',
    text: 'text-green-600',
    ph: '8.0 (Щелочное средство)',
    phValue: 8,
    inventoryHint: 'Используйте ЗЕЛЁНЫЙ инвентарь и щелочное средство',
    regulation: regulation(
      [
        'Уберите посуду и остатки пищи со столов',
        'Нанесите щелочное средство на обеденные поверхности',
        'Протрите столы и стулья, обработайте ручки СВЧ и холодильника',
        'Вымойте пол влажной шваброй',
        'Проверьте, что поверхности сухие (анти-скользкость)',
      ],
      [
        { label: 'Химия', value: 'только пищевая, pH 8' },
        { label: 'Экспозиция', value: '1–2 мин' },
        { label: 'Ветошь для столов', value: 'одноразовая' },
      ],
      [
        { label: 'Химия', value: 'щелочное средство (пищевое), pH 8' },
        { label: 'Инвентарь', value: 'зелёный набор' },
        { label: 'СИЗ', value: 'перчатки + фартук' },
      ],
    ),
  },
}

const zone = (
  id: string,
  name: string,
  type: ZoneType,
  time: string,
  address: string,
  tasks: Array<{ title: string; hidden?: boolean }>,
): Zone => ({
  id,
  name,
  type,
  time,
  address,
  ...zoneTemplates[type],
  icon:
    type === 'blue' ? 'briefcase' : type === 'red' ? 'droplets' : type === 'green' ? 'coffee' : 'alert-triangle',
  status: 'locked',
  tasks: tasks.map((t, i) => ({
    id: `${id}-${i}`,
    title: t.title,
    hidden: !!t.hidden,
    crucial: !!t.hidden,
    assigned: true,
    done: false,
  })),
})

/** Маршрутная карта: строгая последовательность (Анти-хаос).
 *  Каждая зона — отдельная точка (адрес): клинер за день объезжает несколько объектов. */
export const seedZones: Zone[] = [
  zone('z1', 'Офис и Коридоры', 'blue', '10:00 – 10:30', 'БЦ «Меридиан» · пр. Достык, 97', [
    { title: 'Пропылесосить ковролин' },
    { title: 'Протереть рабочие столы' },
    { title: 'Дверные ручки и выключатели', hidden: true },
  ]),
  zone('z2', 'Санузел (Женский)', 'red', '10:30 – 10:50', 'БЦ «Орбита» · ул. Жарокова, 140', [
    { title: 'Очистка унитазов и раковин' },
    { title: 'Замена туалетной бумаги' },
    { title: 'Кнопки смыва и диспенсеры', hidden: true },
    { title: 'Вентиляционные решетки', hidden: true },
  ]),
  zone('z3', 'Кафетерий', 'green', '10:50 – 11:20', 'Кафетерий «Горизонт» · ул. Жибек Жолы, 60', [
    { title: 'Протереть обеденные столы' },
    { title: 'Мытье полов' },
    { title: 'Ручка холодильника и СВЧ', hidden: true },
  ]),
  zone('z4', 'Паркинг и входная группа', 'yellow', '11:20 – 11:40', 'ТЦ «Гранд» · мкр. Самал-2, 111', [
    { title: 'Влажная уборка входной группы' },
    { title: 'Мусорные баки на паркинге' },
    { title: 'Кнопка лифта и домофон', hidden: true },
  ]),
]

export const routeFactory = () =>
  seedZones.map((z, i) => ({
    ...z,
    tasks: z.tasks.map((t) => ({ ...t, done: false })),
    status: i === 0 ? ('active' as const) : ('locked' as const),
  }))

/* ---- Материалы для редактора плана в CRM ---- */

/** Иконка зоны по типу */
export const zoneIconName = (type: ZoneType): string =>
  type === 'blue' ? 'briefcase' : type === 'red' ? 'droplets' : type === 'green' ? 'coffee' : 'alert-triangle'

/** Пресеты «стандарта»: тип → базовое название, время и чек-лист из шаблона */
export const planThemes: Record<
  ZoneType,
  { name: string; time: string; tasks: Array<{ title: string; hidden?: boolean }> }
> = {
  blue: {
    name: 'Офис и Коридоры',
    time: '10:00 – 10:30',
    tasks: [
      { title: 'Пропылесосить ковролин' },
      { title: 'Протереть рабочие столы' },
      { title: 'Дверные ручки и выключатели', hidden: true },
    ],
  },
  red: {
    name: 'Санузел',
    time: '10:30 – 10:50',
    tasks: [
      { title: 'Очистка унитазов и раковин' },
      { title: 'Замена туалетной бумаги' },
      { title: 'Кнопки смыва и диспенсеры', hidden: true },
      { title: 'Вентиляционные решетки', hidden: true },
    ],
  },
  green: {
    name: 'Кафетерий',
    time: '10:50 – 11:20',
    tasks: [
      { title: 'Протереть обеденные столы' },
      { title: 'Мытье полов' },
      { title: 'Ручка холодильника и СВЧ', hidden: true },
    ],
  },
  yellow: {
    name: 'Паркинг и входная группа',
    time: '11:20 – 11:40',
    tasks: [
      { title: 'Влажная уборка входной группы' },
      { title: 'Мусорные баки на паркинге' },
      { title: 'Кнопка лифта и домофон', hidden: true },
    ],
  },
}

/** Банк адресов для назначения зонам в редакторе плана */
export const planAddresses = [
  'БЦ «Меридиан» · пр. Достык, 97',
  'БЦ «Орбита» · ул. Жарокова, 140',
  'Кафетерий «Горизонт» · ул. Жибек Жолы, 60',
  'ТЦ «Гранд» · мкр. Самал-2, 111',
  'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77',
  'Школа № 12 · ул. Ауэзова, 88',
  'Фитнес «Империя» · ул. Тимирязева, 34',
]

/** Полная зона плана: маршрут, чек-лист и регламент подтянуты из шаблона типа */
export const planZone = (
  id: string,
  type: ZoneType,
  time: string,
  address: string,
  status: ZoneStatus,
  name?: string,
  tasks?: Array<{ title: string; hidden?: boolean }>,
): Zone => ({
  id,
  name: name ?? planThemes[type].name,
  type,
  time,
  address,
  status,
  ...zoneTemplates[type],
  icon: zoneIconName(type),
  tasks: (tasks ?? planThemes[type].tasks).map((t, i) => ({
    id: `${id}-${i}`,
    title: t.title,
    hidden: !!t.hidden,
    crucial: !!t.hidden,
    assigned: true,
    done: false,
  })),
})

export const seedCleaner: Cleaner = {
  id: 'c1',
  name: 'Айгуль М.',
  rating: 4.9,
  experienceMonths: 2,
  avatar: 'А',
}

// ---- CRM: команда клинеров (многие клинеры, точки, смены, статусы, планы) ----

const teamCleaner = (
  id: string,
  fio: string,
  avatar: string,
  rating: number,
  experienceMonths: number,
  phone: string,
  shift: string,
  status: TeamCleaner['status'],
  progress: number,
  address: string,
  points: string[],
  currentZone: string,
  violations: number,
  plan: Zone[],
): TeamCleaner => ({
  id,
  fio,
  avatar,
  rating,
  experienceMonths,
  phone,
  shift,
  status,
  progress,
  address,
  points,
  currentZone,
  violations,
  plan,
})

export const seedTeam: TeamCleaner[] = [
  teamCleaner(
    't1',
    'Айгуль Муратова',
    'АМ',
    4.9,
    2,
    '+7 701 555 01 01',
    '08:00 – 17:00',
    'zone',
    25,
    'БЦ «Меридиан» · пр. Достык, 97',
    ['БЦ «Меридиан» · пр. Достык, 97', 'БЦ «Орбита» · ул. Жарокова, 140', 'Кафетерий «Горизонт» · ул. Жибек Жолы, 60', 'ТЦ «Гранд» · мкр. Самал-2, 111'],
    'Офис и Коридоры',
    0,
    routeFactory(), // план Айгуль === live-маршрут (id z1–z4)
  ),
  teamCleaner(
    't2',
    'Даурен Ким',
    'ДК',
    4.7,
    8,
    '+7 702 555 02 02',
    '09:00 – 18:00',
    'route',
    68,
    'БЦ «Орбита» · ул. Жарокова, 140',
    ['БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'БЦ «Орбита» · ул. Жарокова, 140', 'Фитнес «Империя» · ул. Тимирязева, 34'],
    'В пути → БЦ «Орбита»',
    0,
    [
      planZone('t2z1', 'blue', '09:00 – 09:40', 'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'completed'),
      planZone('t2z2', 'red', '09:40 – 10:10', 'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'completed', 'Санузел (Мужской)'),
      planZone('t2z3', 'red', '10:30 – 10:50', 'БЦ «Орбита» · ул. Жарокова, 140', 'active', 'Санузел (Женский)'),
      planZone('t2z4', 'yellow', '11:10 – 11:40', 'Фитнес «Империя» · ул. Тимирязева, 34', 'locked', 'Раздевалка фитнеса'),
    ],
  ),
  teamCleaner(
    't3',
    'Мадина Ахметова',
    'МА',
    5.0,
    14,
    '+7 700 555 03 03',
    '08:00 – 16:00',
    'break',
    55,
    'Кафетерий «Горизонт» · ул. Жибек Жолы, 60',
    ['Кафетерий «Горизонт» · ул. Жибек Жолы, 60', 'Школа № 12 · ул. Ауэзова, 88'],
    'Перерыв 12:30 – 12:50',
    0,
    [
      planZone('t3z1', 'green', '11:00 – 11:30', 'Кафетерий «Горизонт» · ул. Жибек Жолы, 60', 'completed'),
      planZone('t3z2', 'blue', '11:40 – 12:20', 'Школа № 12 · ул. Ауэзова, 88', 'active', 'Классы и коридоры'),
      planZone('t3z3', 'yellow', '13:00 – 13:30', 'Школа № 12 · ул. Ауэзова, 88', 'locked', 'Спортивный зал'),
    ],
  ),
  teamCleaner(
    't4',
    'Ержан Нурланов',
    'ЕН',
    4.5,
    3,
    '+7 705 555 04 04',
    '08:00 – 16:00',
    'late',
    0,
    'ТЦ «Гранд» · мкр. Самал-2, 111',
    ['ТЦ «Гранд» · мкр. Самал-2, 111', 'Школа № 12 · ул. Ауэзова, 88', 'БЦ «Меридиан» · пр. Достык, 97'],
    'Смена ещё не начата',
    1,
    [
      planZone('t4z1', 'yellow', '08:20 – 08:40', 'ТЦ «Гранд» · мкр. Самал-2, 111', 'locked'),
      planZone('t4z2', 'blue', '09:00 – 09:40', 'Школа № 12 · ул. Ауэзова, 88', 'locked', 'Классы и коридоры'),
      planZone('t4z3', 'blue', '10:00 – 10:30', 'БЦ «Меридиан» · пр. Достык, 97', 'locked'),
    ],
  ),
  teamCleaner(
    't5',
    'Салтанат Бекова',
    'СБ',
    4.8,
    6,
    '+7 707 555 05 05',
    '07:00 – 15:00',
    'done',
    100,
    'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77',
    ['БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'Кафетерий «Горизонт» · ул. Жибек Жолы, 60', 'БЦ «Орбита» · ул. Жарокова, 140'],
    'Смена завершена',
    0,
    [
      planZone('t5z1', 'blue', '07:00 – 07:40', 'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'completed'),
      planZone('t5z2', 'green', '08:00 – 08:30', 'Кафетерий «Горизонт» · ул. Жибек Жолы, 60', 'completed'),
      planZone('t5z3', 'red', '09:00 – 09:20', 'БЦ «Орбита» · ул. Жарокова, 140', 'completed', 'Санузел (Женский)'),
    ],
  ),
  teamCleaner(
    't6',
    'Виктор Гончаров',
    'ВГ',
    4.6,
    11,
    '+7 708 555 06 06',
    '09:00 – 18:00',
    'offline',
    0,
    '—',
    ['Фитнес «Империя» · ул. Тимирязева, 34', 'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77'],
    'Не вышел на смену',
    0,
    [
      planZone('t6z1', 'yellow', '09:00 – 09:30', 'Фитнес «Империя» · ул. Тимирязева, 34', 'locked', 'Раздевалка фитнеса'),
      planZone('t6z2', 'blue', '10:00 – 10:40', 'БЦ «Нурлы Тау» · пр. Аль-Фараби, 77', 'locked'),
    ],
  ),
]