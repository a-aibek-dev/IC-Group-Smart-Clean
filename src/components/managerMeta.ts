import type { CleanerShiftStatus } from '../types'

/** Общие метаданные статусов процесса клинера (CRM менеджера) */
export const STATUS_META: Record<
  CleanerShiftStatus,
  { label: string; badge: string; bar: string; dot: string }
> = {
  zone: { label: 'Убирает зону', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', dot: 'bg-blue-500' },
  route: { label: 'В пути к точке', badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500', dot: 'bg-violet-500' },
  break: { label: 'Перерыв', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  late: { label: 'Опоздание', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500', dot: 'bg-red-500' },
  done: { label: 'Смена завершена', badge: 'bg-brand-100 text-brand-700', bar: 'bg-brand-500', dot: 'bg-brand-500' },
  offline: { label: 'Не на связи', badge: 'bg-slate-200 text-slate-600', bar: 'bg-slate-300', dot: 'bg-slate-400' },
}