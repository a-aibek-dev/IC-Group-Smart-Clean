import { useMemo, useState } from 'react'
import {
  BarChart3,
  LogOut,
  Eye,
  Users,
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  Route,
  Search,
  Phone,
  Clock,
  ChevronDown,
  Star,
  AlertTriangle,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../store'
import { PlanEditor } from './PlanEditor'
import { STATUS_META } from './managerMeta'
import type { TeamCleaner, Zone } from '../types'

type FilterKey = 'all' | 'work' | 'break' | 'late' | 'done' | 'offline'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'work', label: 'В работе' },
  { key: 'break', label: 'Перерыв' },
  { key: 'late', label: 'Опоздания' },
  { key: 'done', label: 'Завершено' },
  { key: 'offline', label: 'Не на связи' },
]

const filterMatches = (c: TeamCleaner, key: FilterKey): boolean => {
  if (key === 'all') return true
  if (key === 'work') return c.status === 'zone' || c.status === 'route'
  return c.status === key
}

/* ---------- Карточка клинера (CRM) ---------- */
function CleanerCard({
  cleaner,
  expanded,
  selected,
  onToggle,
  onAssign,
}: {
  cleaner: TeamCleaner
  expanded: boolean
  selected: boolean
  onToggle: () => void
  onAssign: () => void
}) {
  const meta = STATUS_META[cleaner.status]
  const hasViolations = cleaner.violations > 0

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
        hasViolations ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100'
      } ${selected ? 'ring-2 ring-brand-500 border-brand-300' : ''}`}
    >
      {/* Шапка: ФИО, рейтинг, стаж */}
      <div className="p-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
            {cleaner.avatar}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 truncate">{cleaner.fio}</h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-brand-500 text-brand-500" /> {cleaner.rating}
              </span>
              <span className="text-xs text-slate-400 font-medium">стаж {cleaner.experienceMonths} мес.</span>
              <span className="text-xs text-slate-400 font-medium">· {cleaner.id.replace('t', 'ID ')}</span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 ${meta.badge}`}>
          <span className={`w-2 h-2 rounded-full ${meta.dot} ${cleaner.status === 'zone' || cleaner.status === 'route' ? 'animate-pulse' : ''}`} />
          {meta.label}
        </span>
      </div>

      {/* Смена и телефон */}
      <div className="px-5 pb-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate" title={cleaner.shift}>{cleaner.shift}</span>
        </div>
        <a
          href={`tel:${cleaner.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-1.5 text-sm text-slate-600 font-medium hover:text-brand-600 transition-colors"
        >
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{cleaner.phone}</span>
        </a>
      </div>

      {/* Прогресс смены */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs font-bold mb-1">
          <span className="text-slate-500">Прогресс смены</span>
          <span className="text-slate-800">{cleaner.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full ${meta.bar} transition-all`} style={{ width: `${cleaner.progress}%` }} />
        </div>
      </div>

      {/* Где сейчас */}
      <div className="px-5 pb-3 space-y-1.5">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Сейчас</p>
        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-500 shrink-0" /> {cleaner.currentZone}
        </p>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <span className="inline-block w-6" />
          {cleaner.address}
        </p>
      </div>

      {/* Точки на сегодня */}
      <div className="px-5 pb-4">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
          Точки на сегодня · {cleaner.points.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {cleaner.points.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded-full px-2 py-1 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="truncate max-w-[180px]">{p}</span>
            </span>
          ))}
        </div>
      </div>

      {hasViolations && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Нарушение регламента (pH): {cleaner.violations} шт. · перекрестное загрязнение
        </div>
      )}

      {/* Назначить план */}
      <div className="px-4 pb-3">
        <button
          onClick={onAssign}
          className={`w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            selected
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
              : 'bg-slate-900 text-white hover:bg-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {selected ? 'План открыт ниже' : 'Настроить план этого клинера'}
        </button>
      </div>

      {/* Разворачиваемый план */}
      <button
        onClick={onToggle}
        className="w-full border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors px-5 py-3 flex items-center justify-between text-sm font-bold text-slate-700"
      >
        <span className="flex items-center gap-2">
          <Route className="w-4 h-4 text-brand-500" /> План дня · {cleaner.plan.length} зоны
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="bg-white p-3 space-y-2 animate-fade-in">
          {cleaner.plan.map((z, i) => (
            <div key={z.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
              <span className={`w-8 h-8 rounded-lg ${z.lightColor} ${z.text} flex items-center justify-center text-xs font-extrabold shrink-0`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{z.name}</p>
                <p className="text-xs text-slate-400 truncate">{z.time} · {z.address}</p>
              </div>
              <ZoneStatusBadge status={z.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ZoneStatusBadge({ status }: { status: Zone['status'] }) {
  if (status === 'completed')
    return <span className="shrink-0 bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-xs font-bold">Проверено</span>
  if (status === 'active')
    return <span className="shrink-0 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold animate-pulse">В процессе</span>
  return <span className="shrink-0 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">Ожидает</span>
}

/* ---------- Дашборд ---------- */
export function ManagerDashboard() {
  const { zones, team, logout, openZone } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>('t1')

  const selectedCleaner = team.find((c) => c.id === selectedId) ?? team[0]

  const selectCleaner = (id: string) => {
    setSelectedId(id)
    setExpandedId(null)
    requestAnimationFrame(() => {
      document.getElementById('plan-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const onShift = team.filter((c) => c.status !== 'offline').length
  const working = team.filter((c) => c.status === 'zone' || c.status === 'route').length
  const late = team.filter((c) => c.status === 'late').length
  const violations = team.reduce((s, c) => s + c.violations, 0)

  const cleanCompleted = selectedCleaner.plan.filter((z) => z.status === 'completed').length
  const cleanlinessIndex = selectedCleaner.plan.length
    ? Math.round((cleanCompleted / selectedCleaner.plan.length) * 100)
    : 0

  const teamList = useMemo(() => {
    const q = query.trim().toLowerCase()
    return team.filter((c) => filterMatches(c, filter)).filter((c) => {
      if (!q) return true
      return (
        c.fio.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.points.some((p) => p.toLowerCase().includes(q)) ||
        c.currentZone.toLowerCase().includes(q)
      )
    })
  }, [query, filter, team])

  const activeZone = selectedCleaner.plan.find((z) => z.status === 'active')

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col">
      {/* Навбар */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center z-10 shrink-0 gap-2">
        <div className="flex items-center min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white mr-2.5 sm:mr-3 shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight truncate">
              IC Group · CRM Клинеров
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              Клинеры, точки и смены в реальном времени
            </p>
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
        <div className="max-w-7xl mx-auto space-y-6 pb-16 sm:pb-20">
          {/* Статистика */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={<ShieldCheck className="w-6 h-6" />}
              iconBg="bg-brand-50 text-brand-500"
              label={`Индекс чистоты · ${selectedCleaner.fio}`}
              value={`${cleanlinessIndex}%`}
              sub={`По плану клинера: выполнено ${cleanCompleted} из ${selectedCleaner.plan.length} зон`}
              subClass="text-brand-600"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              iconBg="bg-blue-50 text-blue-500"
              label="На смене сегодня"
              value={`${onShift} из ${team.length}`}
              sub={`${working} в работе · ${team.filter((c) => c.status === 'break').length} на перерыве`}
            />
            <StatCard
              icon={<AlertTriangle className="w-6 h-6" />}
              iconBg="bg-red-50 text-red-500"
              label="Опоздания"
              value={String(late)}
              sub="Антифрод GPS: чекин по времени"
            />
            <StatCard
              icon={<Eye className="w-6 h-6" />}
              iconBg="bg-orange-50 text-orange-500"
              label="Нарушения регламента (pH)"
              value={String(violations)}
              sub={violations > 0 ? 'Требуют разбора с супервайзером' : 'Перекрестного загрязнения не выявлено'}
            />
          </div>

          {/* CRM: Клинеры и точки. Поиск + фильтры */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-brand-500" /> Клинеры и точки
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  ФИО · время смены · статус процесса · адреса объектов на сегодня
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по ФИО, адресу, зоне…"
                    className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {FILTERS.map((f) => {
                const count =
                  f.key === 'all'
                    ? team.length
                    : f.key === 'work'
                      ? team.filter((c) => c.status === 'zone' || c.status === 'route').length
                      : team.filter((c) => c.status === f.key).length
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      filter === f.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                    <span
                      className={`px-1.5 rounded-full text-[10px] ${
                        filter === f.key ? 'bg-white/20' : 'bg-white text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {teamList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                Никого не нашли. Попробуйте изменить запрос или фильтр.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
                {teamList.map((c) => (
                  <CleanerCard
                    key={c.id}
                    cleaner={c}
                    selected={c.id === selectedCleaner.id}
                    expanded={expandedId === c.id}
                    onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    onAssign={() => selectCleaner(c.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Редактор плана выбранного клинера: маршрут, чек-лист, стандарт */}
          <PlanEditor cleaner={selectedCleaner} />

          {/* Фото-мониторинг скрытых зон плана выбранного клинера */}
          <h3 className="text-xl font-bold text-slate-800 pt-4 flex items-center gap-2">
            Фото-мониторинг скрытых зон
            <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
              {selectedCleaner.fio} · {activeZone ? `В процессе: ${activeZone.name}` : 'Завершено'}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {selectedCleaner.plan.map((zone) => {
              // Фото-отчет открывает приложение клинера только когда зона —
              // часть live-маршрута Айгуль (id совпадают).
              const liveZone = zones.find((z) => z.id === zone.id)
              return (
                <div
                  key={zone.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${
                    zone.status === 'active' ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-100'
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
                        .filter((t) => t.hidden && (t.assigned ?? true))
                        .map((t) => (
                          <li key={t.id} className="flex justify-between items-center text-sm">
                            <span className={t.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>
                              {t.title}
                            </span>
                            {t.done ? (
                              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" /> {zone.address}
                      <span className="mx-1.5 text-slate-300">·</span>
                      {zone.time}
                    </div>
                    <button
                      disabled={!liveZone}
                      onClick={() => liveZone && zone.status === 'active' && openZone(zone.id)}
                      className="text-brand-600 text-xs font-bold flex items-center hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                      title={liveZone ? 'Открыть приложение клинера' : 'Зона из плана клинера (не в live-маршруте Айгуль)'}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {liveZone ? 'Фото-отчет' : 'План в CRM'}
                    </button>
                  </div>
                </div>
              )
            })}
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