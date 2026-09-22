import { useState } from 'react'
import {
  GripVertical,
  ChevronDown,
  Trash2,
  Plus,
  RotateCcw,
  MapPin,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  Eye,
  Check,
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
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '../store'
import { planAddresses } from '../data/mock'
import { STATUS_META } from './managerMeta'
import type { TeamCleaner, Zone, ZoneType } from '../types'

const ZONE_TYPE_ORDER: ZoneType[] = ['blue', 'yellow', 'red', 'green']

const TYPE_LABEL: Record<ZoneType, string> = {
  blue: 'Общие зоны',
  yellow: 'Грязные зоны',
  red: 'Санузлы',
  green: 'Кафетерии',
}
const TYPE_DOT: Record<ZoneType, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
}
const TYPE_ACTIVE: Record<ZoneType, string> = {
  blue: 'ring-2 ring-blue-500 bg-blue-50',
  yellow: 'ring-2 ring-yellow-500 bg-yellow-50',
  red: 'ring-2 ring-red-500 bg-red-50',
  green: 'ring-2 ring-green-500 bg-green-50',
}

function ZoneStatusChip({ status }: { status: Zone['status'] }) {
  if (status === 'completed')
    return <span className="shrink-0 bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold">Проверено</span>
  if (status === 'active')
    return <span className="shrink-0 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold animate-pulse">В процессе</span>
  return <span className="shrink-0 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">Ожидает</span>
}

/** Сортируемая строка зоны плана + раскрывающиеся настройки (стандарт, чек-лист, адрес, время) */
function PlanZoneRow({
  zone,
  index,
  cleanerId,
}: {
  zone: Zone
  index: number
  cleanerId: string
}) {
  const {
    setCleanerZoneType,
    setCleanerZoneField,
    toggleTaskAssigned,
    addCleanerTask,
    removeCleanerTask,
    removeCleanerZone,
    showToast,
  } = useApp()
  const [open, setOpen] = useState(false)
  const [newTask, setNewTask] = useState('')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: zone.id })

  const hiddenCount = zone.tasks.filter((t) => t.hidden).length
  const assignedCount = zone.tasks.filter((t) => t.assigned ?? true).length

  const addTask = () => {
    if (!newTask.trim()) return
    addCleanerTask(cleanerId, zone.id, newTask)
    setNewTask('')
    showToast('Пункт добавлен в чек-лист зоны.')
  }

  const addressOptions = planAddresses.includes(zone.address)
    ? planAddresses
    : [zone.address, ...planAddresses]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white rounded-xl shadow-sm border ${
        isDragging ? 'opacity-60 ring-2 ring-brand-500 border-brand-300' : 'border-slate-100'
      } ${open ? 'ring-1 ring-brand-200' : ''}`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0 p-2 -m-2 touch-none select-none"
            aria-label="Перетащить зону (зажмите и ведите)"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${zone.lightColor} ${zone.text}`}
          >
            {index + 1}
          </span>
          <span className={`w-3 h-3 rounded-full shrink-0 ${zone.colorClass}`} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 text-sm truncate">
              {zone.name}
              {hiddenCount > 0 && (
                <span className="ml-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full align-middle">
                  скрытых: {hiddenCount}
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {zone.time} · {zone.address}
            </p>
          </div>
          <ZoneStatusChip status={zone.status} />
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="Настройки зоны: стандарт, чек-лист, адрес"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => removeCleanerZone(cleanerId, zone.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Удалить зону из плана"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 animate-fade-in">
          {/* Стандарт: тип зоны → регламент, цвет, pH */}
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Стандарт (регламент SOP)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ZONE_TYPE_ORDER.map((type) => (
                <button
                  key={type}
                  onClick={() => setCleanerZoneType(cleanerId, zone.id, type)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                    zone.type === type
                      ? TYPE_ACTIVE[type] + ' border-transparent'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${TYPE_DOT[type]}`} />
                  {TYPE_LABEL[type]}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
              Смена стандарта подтянет цвет зоны, pH, инвентарь и регламент из шаблона: у клинера на телефоне обновится SOP.
            </p>
          </div>

          {/* Время и адрес */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Время уборки
              </span>
              <input
                value={zone.time}
                onChange={(e) => setCleanerZoneField(cleanerId, zone.id, 'time', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Точка (адрес объекта)
              </span>
              <select
                value={zone.address}
                onChange={(e) => setCleanerZoneField(cleanerId, zone.id, 'address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {addressOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Чек-лист */}
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" /> Чек-лист · {assignedCount} назначено
            </p>
            <div className="space-y-1.5">
              {zone.tasks.map((t) => {
                const checked = t.assigned ?? true
                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${
                      t.hidden ? 'bg-orange-50/60 border-orange-100' : 'border-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => !t.hidden && toggleTaskAssigned(cleanerId, zone.id, t.id)}
                      disabled={t.hidden}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        t.hidden
                          ? 'bg-orange-500 border-orange-500 text-white cursor-default'
                          : checked
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'border-slate-300 hover:border-brand-400'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </button>
                    <span
                      className={`text-sm flex-1 min-w-0 truncate ${
                        checked ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'
                      }`}
                    >
                      {t.title}
                    </span>
                    {t.hidden && (
                      <span className="shrink-0 text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Скрытая деталь
                      </span>
                    )}
                    {!t.hidden && (
                      <button
                        onClick={() => removeCleanerTask(cleanerId, zone.id, t.id)}
                        className="shrink-0 p-1 text-slate-300 hover:text-red-600 transition-colors"
                        title="Убрать пункт из чек-листа"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Новый пункт чек-листа…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              <button
                onClick={addTask}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                title="Добавить пункт"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Редактор плана конкретного клинера: маршрут (drag&drop), стандарт, чек-лист */
export function PlanEditor({ cleaner }: { cleaner: TeamCleaner }) {
  const { moveCleanerZone, resetCleanerPlan, addCleanerZone } = useApp()
  const meta = STATUS_META[cleaner.status]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cleaner.plan.findIndex((z) => z.id === active.id)
    const newIndex = cleaner.plan.findIndex((z) => z.id === over.id)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
    moveCleanerZone(cleaner.id, oldIndex, newIndex)
  }

  const completed = cleaner.plan.filter((z) => z.status === 'completed').length
  const planDone = cleaner.plan.length ? Math.round((completed / cleaner.plan.length) * 100) : 0

  const addZone = (type: ZoneType) => {
    addCleanerZone(cleaner.id, type)
  }

  return (
    <div id="plan-editor" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
      {/* Шапка редактора */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-brand-500 text-white flex items-center justify-center font-extrabold shrink-0">
            {cleaner.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              План смены клинера
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
                {cleaner.fio}
              </span>
            </h3>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center flex-wrap gap-x-2">
              <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${meta.badge}`}>{meta.label}</span>
              <span>· {cleaner.shift}</span>
              <span>· {cleaner.points.length} точки</span>
              <span>· план выполнен на {planDone}%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cleaner.id === 't1' && (
            <span className="bg-brand-100 text-brand-900 px-2.5 py-1 rounded-full text-xs font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-brand-500 mr-2 animate-pulse" /> Live (телефон клинера)
            </span>
          )}
          <button
            onClick={() => resetCleanerPlan(cleaner.id)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-sm font-semibold px-3"
            title="Сбросить план клинера к стандартному шаблону"
          >
            <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Сбросить план</span>
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-4">
        Маршрут: перетаскивайте зоны — активной станет первая невыполненная. У каждой зоны нажмите «настройки»:
        назначьте стандарт (регламент), чек-лист, адрес точки и время.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cleaner.plan.map((z) => z.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {cleaner.plan.map((zone, i) => (
              <PlanZoneRow key={zone.id} zone={zone} index={i} cleanerId={cleaner.id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Добавить зону */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Добавить зону в маршрут
        </p>
        <div className="flex flex-wrap gap-2">
          {ZONE_TYPE_ORDER.map((type) => (
            <button
              key={type}
              onClick={() => addZone(type)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-brand-300 hover:bg-brand-50 transition-all"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[type]}`} />
              {TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}