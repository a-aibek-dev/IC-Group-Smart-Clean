import {
  LogOut,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../store'
import { zoneTemplates } from '../data/mock'

export function RouteScreen() {
  const { zones, cleaner, logout, openZone, showToast } = useApp()
  const active = zones.find((z) => z.status === 'active')
  const completedCount = zones.filter((z) => z.status === 'completed').length
  const lockedCount = zones.filter((z) => z.status === 'locked').length

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* Шапка клинера */}
      <header className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 flex justify-between items-center shrink-0">
        <div>
          <p className="text-sm text-slate-500 font-medium">Смена активна · {completedCount}/{zones.length} зон</p>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {cleaner.name}
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {cleaner.rating}
            </span>
          </h2>
        </div>
        <button onClick={logout} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-1">Карта маршрута</h3>
          <p className="text-slate-500 mb-6 text-sm">Следуйте строго по плану во избежание перекрестного загрязнения.</p>

          {/* Активная зона — большой цветной блок (Экран 1: Жесткий Маршрут) */}
          {active && (
            <button
              onClick={() => openZone(active.id)}
              className={`w-full ${active.colorClass} text-white rounded-2xl p-6 mb-8 text-left shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.99]`}
            >
              <div className="flex justify-between items-start">
                <MapPin className="w-6 h-6 opacity-90" />
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                  Шаг {zones.findIndex((z) => z.id === active.id) + 1} из {zones.length}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-6 font-medium">Сейчас нужно убрать</p>
              <h4 className="text-3xl font-bold mt-1 leading-tight">{active.name}</h4>
              <p className="text-white/80 text-sm mt-2">{active.time}</p>
              <div className="mt-4 bg-white/20 backdrop-blur rounded-xl p-3 border border-white/30 flex items-center gap-2">
                <span className="font-semibold text-sm">Приступить</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </div>
            </button>
          )}

          <div className="relative pl-5">
            {/* Линия маршрута */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

            <div className="space-y-4">
              {zones.map((zone, index) => {
                const type = zoneTemplates[zone.type]
                const isActive = zone.status === 'active'
                const isCompleted = zone.status === 'completed'
                const isLocked = zone.status === 'locked'

                return (
                  <div key={zone.id} className="relative">
                    <div
                      className={`absolute -left-[13px] top-5 w-4 h-4 rounded-full border-4 z-10 ${
                        isCompleted ? 'bg-brand-500 border-white' : isActive ? `${zone.colorClass} border-white animate-pulse` : 'bg-slate-300 border-white'
                      }`}
                    />
                    <div
                      onClick={() => {
                        if (isActive) openZone(zone.id)
                        else if (isLocked) showToast('Сначала завершите предыдущую зону (Анти-хаос)')
                      }}
                      className={`ml-6 rounded-2xl border p-4 transition-all ${
                        isActive
                          ? `bg-white shadow-md ring-2 ring-offset-2 ${type.text} cursor-pointer transform hover:-translate-y-0.5`
                          : isLocked
                            ? 'bg-slate-50 border-slate-100 opacity-60'
                            : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${type.text} mb-1 block`}
                          >
                            Шаг {index + 1}
                          </span>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">{zone.name}</h4>
                        </div>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-brand-500 shrink-0" />}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">
                          {isActive
                            ? `Текущая зона · ${zone.time}`
                            : isLocked
                              ? `${lockedCount > 0 ? 'Заблокировано' : 'Ожидает'}`
                              : 'Завершено'}
                        </span>
                        {isLocked && (
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Заблокировано
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}