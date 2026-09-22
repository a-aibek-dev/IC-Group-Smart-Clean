export type ZoneType = 'blue' | 'yellow' | 'red' | 'green'

export type ZoneStatus = 'completed' | 'active' | 'locked'

export interface Task {
  id: string
  title: string
  done: boolean
  hidden: boolean
  crucial?: boolean
  /** Назначен ли пункт в чек-лист зоны (менеджер ставит в редакторе плана) */
  assigned?: boolean
}

/** Пара «название — значение» для стандартов и средств */
export interface RegulationItem {
  label: string
  value: string
}

/**
 * Регламент зоны (SOP): КАК это сделать, стандарты и средства.
 * Подтягивается из шаблона типа зоны автоматически.
 */
export interface Regulation {
  /** КАК это сделать — пошаговая процедура уборки */
  procedure: string[]
  /** Стандарты и нормы (время, экспозиция, периодичность) */
  standards: RegulationItem[]
  /** Средства: химия, инвентарь, СИЗ */
  tools: RegulationItem[]
}

export interface Zone {
  id: string
  name: string
  type: ZoneType
  colorClass: string
  lightColor: string
  text: string
  ph: string
  phValue: number
  icon: string
  time: string
  /** Адрес точки (объекта): в день может быть несколько адресов */
  address: string
  status: ZoneStatus
  tasks: Task[]
  inventoryHint: string
  /** Регламент зоны: процедура, стандарты, средства */
  regulation: Regulation
}

export interface Cleaner {
  id: string
  name: string
  rating: number
  experienceMonths: number
  avatar: string
}

/** Статус процесса клинера в смене (для CRM менеджера) */
export type CleanerShiftStatus = 'zone' | 'route' | 'break' | 'late' | 'done' | 'offline'

/** Карточка клинера в CRM менеджера: ФИО, точки, смена, статус процесса */
export interface TeamCleaner {
  id: string
  fio: string
  avatar: string
  rating: number
  experienceMonths: number
  phone: string
  /** Время смены: «08:00 – 17:00» */
  shift: string
  status: CleanerShiftStatus
  /** Прогресс смены, % */
  progress: number
  /** Текущий адрес (где клинер сейчас) */
  address: string
  /** Все точки/адреса смены на сегодня */
  points: string[]
  /** Где именно сейчас: название зоны или пояснение */
  currentZone: string
  /** Нарушения регламента (pH / перекрестное загрязнение) */
  violations: number
  /**
   * Назначенный план: маршрут (порядок зон), чек-лист (tasks),
   * стандарт и регламент (из шаблона типа зоны). Менеджер редактирует
   * план конкретного клинера в CRM.
   */
  plan: Zone[]
}

export type View =
  | 'login'
  | 'cleaner_route'
  | 'cleaner_zone'
  | 'manager_dashboard'
  | 'demo'

export type PhotoStatus = 'idle' | 'scanning' | 'success'

export interface Toast {
  text: string
  id: number
}