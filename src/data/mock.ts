import type { Cleaner, Zone, ZoneType } from '../types'

/** Умные шаблоны: система сама красит зону, подтягивает регламент и чек-лист. */
export const zoneTemplates: Record<
  ZoneType,
  { label: string; colorClass: string; lightColor: string; text: string; ph: string; phValue: number; inventoryHint: string }
> = {
  blue: {
    label: 'Общие зоны',
    colorClass: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    text: 'text-blue-600',
    ph: '7.0 (Нейтральное средство)',
    phValue: 7,
    inventoryHint: 'Используйте СИНИЙ инвентарь и нейтральное средство',
  },
  yellow: {
    label: 'Грязные зоны',
    colorClass: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    text: 'text-yellow-600',
    ph: '4.0 (Кислотная пена)',
    phValue: 4,
    inventoryHint: 'Используйте ЖЁЛТЫЙ инвентарь и кислотную пену',
  },
  red: {
    label: 'Санузлы',
    colorClass: 'bg-red-500',
    lightColor: 'bg-red-50',
    text: 'text-red-600',
    ph: '3.0 (Кислотное средство)',
    phValue: 3,
    inventoryHint: 'Используйте КРАСНЫЙ инвентарь и средство с pH 3.0',
  },
  green: {
    label: 'Кафетерии',
    colorClass: 'bg-green-500',
    lightColor: 'bg-green-50',
    text: 'text-green-600',
    ph: '8.0 (Щелочное средство)',
    phValue: 8,
    inventoryHint: 'Используйте ЗЕЛЁНЫЙ инвентарь и щелочное средство',
  },
}

const zone = (
  id: string,
  name: string,
  type: ZoneType,
  time: string,
  tasks: Array<{ title: string; hidden?: boolean }>,
): Zone => ({
  id,
  name,
  type,
  time,
  ...zoneTemplates[type],
  icon:
    type === 'blue' ? 'briefcase' : type === 'red' ? 'droplets' : type === 'green' ? 'coffee' : 'alert-triangle',
  status: 'locked',
  tasks: tasks.map((t, i) => ({
    id: `${id}-${i}`,
    title: t.title,
    hidden: !!t.hidden,
    crucial: !!t.hidden,
    done: false,
  })),
})

/** Маршрутная карта: строгая последовательность (Анти-хаос). */
export const seedZones: Zone[] = [
  zone('z1', 'Офис и Коридоры', 'blue', '10:00 – 10:30', [
    { title: 'Пропылесосить ковролин' },
    { title: 'Протереть рабочие столы' },
    { title: 'Дверные ручки и выключатели', hidden: true },
  ]),
  zone('z2', 'Санузел (Женский)', 'red', '10:30 – 10:50', [
    { title: 'Очистка унитазов и раковин' },
    { title: 'Замена туалетной бумаги' },
    { title: 'Кнопки смыва и диспенсеры', hidden: true },
    { title: 'Вентиляционные решетки', hidden: true },
  ]),
  zone('z3', 'Кафетерий', 'green', '10:50 – 11:20', [
    { title: 'Протереть обеденные столы' },
    { title: 'Мытье полов' },
    { title: 'Ручка холодильника и СВЧ', hidden: true },
  ]),
  zone('z4', 'Паркинг и входная группа', 'yellow', '11:20 – 11:40', [
    { title: 'Влажная уборка входной группы' },
    { title: 'Мусорные баки на паркинге' },
    { title: 'Кнопка лифта и домофон', hidden: true },
  ]),
]

export const seedCleaner: Cleaner = {
  id: 'c1',
  name: 'Айгуль М.',
  rating: 4.9,
  experienceMonths: 2,
  avatar: 'А',
}

export const routeFactory = () =>
  seedZones.map((z, i) => ({
    ...z,
    tasks: z.tasks.map((t) => ({ ...t, done: false })),
    status: i === 0 ? ('active' as const) : ('locked' as const),
  }))