import {
  BarChart3,
  LogOut,
  Eye,
  Users,
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Route,
  RotateCcw,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp, withActiveFirst } from '../store'
import type { Zone } from '../types'

function SortableZone({ zone, index }: { zone: Zone; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: zone.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white rounded-xl shadow-sm border flex items-center justify-between px-4 py-3 ${
        isDragging ? 'opacity-60 ring-2 ring-brand-500 border-brand-300' : 'border-slate-100'
      } ${zone.status === 'active' ? 'ring-2 ring-offset-1 ring-blue-200 border-blue-300' : ''}`}
    >
      {/* touch-область для перетаскивания */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0 p-2 -m-2 touch-none select-none"
          aria-label="Перетащить зону (зажмите и ведите)"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${zone.colorClass}`}
          style={{ minWidth: 12 }}
        />
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{zone.name}</p>
          <p className="text-xs text-slate-400">{zone.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${zone.lightColor} ${zone.text}`}>
          Шаг {index + 1}
        </span>
        {zone.status === 'active' && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">Активна</span>
        )}
      </div>
    </div>
  )
}

export function ManagerDashboard() {
  const { zones, setZones, logout, openZone, reorderZones, resetRoute, showToast } = useApp()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // Индексы считаем по текущему состоянию ДО setState, toast — после:
    // показывать его внутри апдейтера нельзя (StrictMode → дубликаты).
    const oldIndex = zones.findIndex((z) => z.id === active.id)
    const newIndex = zones.findIndex((z) => z.id === over.id)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
    // После смены порядка активным делаем первую невыполненную зону —
    // иначе «актив» оставался на старой зоне и первый шаг не менялся.
    setZones((prev) => withActiveFirst(arrayMove(prev, oldIndex, newIndex)))
    showToast('Маршрут обновлен: порядок зон изменен.')
  }

  const completed = zones.filter((z) => z.status === 'completed').length
  const active = zones.find((z) => z.status === 'active')
  const cleanlinessIndex = Math.round((completed / zones.length) * 100)

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      {/* Навбар */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center z-10 shrink-0 gap-2">
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white mr-2.5 sm:mr-3 shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight truncate">IC Group Control</h1>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">Мониторинг качества (БЦ Нурлы Тау)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="bg-brand-100 text-brand-900 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center">
            <span className="w-2 h-2 rounded-full bg-brand-500 mr-2 animate-pulse" /> Live
          </span>
          <button onClick={logout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        {/* pb-16/20: запас под нижний тост — не накрывает карточки мониторинга */}
        <div className="max-w-6xl mx-auto space-y-6 pb-16 sm:pb-20">
          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={<Eye className="w-6 h-6" />}
              iconBg="bg-orange-50 text-orange-500"
              label="Индекс чистоты (Скрытые зоны)"
              value={`${cleanlinessIndex}%`}
              sub="+5% после внедрения чеклиста"
              subClass="text-brand-600"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              iconBg="bg-blue-50 text-blue-500"
              label="Сотрудников на смене"
              value="12"
              sub="0 опозданий (Антифрод GPS активен)"
            />
            <StatCard
              icon={<ShieldCheck className="w-6 h-6" />}
              iconBg="bg-brand-50 text-brand-500"
              label="Нарушения регламента (pH)"
              value="0"
              sub="Перекрестного загрязнения не выявлено"
            />
          </div>

          {/* Визуальный конструктор маршрута (Drag & Drop) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <Route className="w-5 h-5 text-brand-500" /> Конструктор маршрута
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetRoute}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-sm font-semibold px-3"
                  title="Сбросить маршрут к стандартному порядку (для всех окон)"
                >
                  <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Сбросить</span>
                </button>
                <button
                  onClick={() => reorderZones('backward')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Передвинуть активную зону назад"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorderZones('forward')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Передвинуть активную зону вперед"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-slate-500 text-sm mb-4">
              Перетаскивайте зоны, чтобы изменить порядок уборки — система автоматически подтянет чек-лист, регламент и цвет из шаблона.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={zones.map((z) => z.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {zones.map((zone, i) => (
                    <SortableZone key={zone.id} zone={zone} index={i} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Live-мониторинг */}
          <h3 className="text-xl font-bold text-slate-800 pt-4 flex items-center gap-2">
            Мониторинг маршрутов (Айгуль М.)
            <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
              {active ? 'В процессе' : 'Завершено'}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${
                  zone.status === 'active' ? `border-${zone.type}-300 ring-4 ring-${zone.type}-50` : 'border-slate-100'
                }`}
              >
                <div className={`${zone.lightColor} px-5 py-4 border-b border-white/20 flex justify-between items-center`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${zone.colorClass}`} />
                    <h4 className="font-bold text-slate-800 text-sm truncate">{zone.name}</h4>
                  </div>
                  <StatusBadge status={zone.status} />
                </div>
                <div className="p-5 flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Скрытые зоны
                  </p>
                  <ul className="space-y-3">
                    {zone.tasks
                      .filter((t) => t.hidden)
                      .map((t) => (
                        <li key={t.id} className="flex justify-between items-center text-sm">
                          <span className={t.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>
                            {t.title}
                          </span>
                          {t.done ? (
                            <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500">
                    <MapPin className="w-3 h-3 mr-1" /> GPS: Совпадает · {zone.time}
                  </div>
                  <button
                    onClick={() => zone.status === 'active' && openZone(zone.id)}
                    className="text-brand-600 text-xs font-bold flex items-center hover:underline"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" /> Фото-отчет
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  subClass = 'text-slate-500',
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub: string
  subClass?: string
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 font-medium text-sm mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-xs font-medium ${subClass}`}>{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: Zone['status'] }) {
  if (status === 'completed')
    return <span className="bg-brand-100 text-brand-700 px-2 py-1 rounded text-xs font-bold border border-brand-200">Проверено</span>
  if (status === 'active')
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200 animate-pulse">В процессе</span>
  return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold border border-slate-200">Ожидает</span>
}