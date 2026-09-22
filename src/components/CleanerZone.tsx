import { useMemo } from 'react'
import {
  ArrowLeft,
  FlaskConical,
  Check,
  Eye,
  Camera,
  ScanLine,
  CheckCircle,
  ClipboardCheck,
} from 'lucide-react'
import { useApp } from '../store'
import type { Zone } from '../types'

export function ZoneScreen() {
  const { zones, activeZoneId, photoStatus, backToRoute, toggleTask, simulatePhoto, finishZone } = useApp()

  const zone = zones.find((z: Zone) => z.id === activeZoneId)
  const baseTasks = useMemo(() => zone?.tasks.filter((t) => !t.hidden) ?? [], [zone])
  const hiddenTasks = useMemo(() => zone?.tasks.filter((t) => t.hidden) ?? [], [zone])
  const allDone = zone?.tasks.every((t) => t.done) ?? false
  const hiddenDone = hiddenTasks.filter((t) => t.done).length

  if (!zone) return null

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in">
      {/* ЭКРАН 2: Цветная шапка зоны — весь экран красится в цвет зоны */}
      <div className={`${zone.colorClass} px-6 pt-12 pb-14 relative overflow-hidden shrink-0`}>
        <ArrowLeft
          onClick={backToRoute}
          className="w-5 h-5 mb-6 text-white/80 hover:text-white cursor-pointer"
        />
        <h2 className="text-3xl font-bold text-white mb-4">{zone.name}</h2>

        {/* Подсказка pH + инвентарь (Защита от перекрестного загрязнения) */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-white shrink-0" />
            <div>
              <p className="text-[10px] text-white/80 uppercase tracking-wide leading-none">pH Scale · Химия</p>
              <p className="font-semibold text-sm text-white">
                pH {zone.phValue} · {zone.ph.split('(')[1]?.replace(')', '')}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/90 font-medium pl-7">{zone.inventoryHint}</p>
        </div>
      </div>

      {/* Чек-лист: скролл-контейнер сам наезжает на цветную шапку (перехлёст),
          а НЕ внутренний блок — иначе верх карточки обрезается overflow-y */}
      <div className="flex-1 min-h-0 overflow-y-auto relative z-10 -mt-6">
        {/* pb-24: запас под нижний тост, чтобы он не накрывал «Фото-итог» и «Завершить» */}
        <div className="px-6 pb-24">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="flex items-center gap-2">
                {/* Слово «Чеклист» — специально выделено бейджем */}
                <span className="bg-brand-500/10 text-brand-700 px-2 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5" /> Чеклист
                </span>
                <span className="text-sm font-semibold text-slate-500">Базовые стандарты</span>
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {baseTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(zone.id, task.id)}
                  className="flex items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                      task.done ? `${zone.colorClass} border-transparent text-white` : 'border-slate-300'
                    }`}
                  >
                    {task.done && <Check className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-base ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Скрытые детали — Эффект ореола */}
            <div className="p-4 bg-orange-50 border-y border-orange-100 mt-2">
              <h3 className="font-bold text-orange-800 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" /> Скрытые детали
                <span className="ml-auto text-orange-600 text-xs font-bold">
                  {hiddenDone}/{hiddenTasks.length}
                </span>
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {hiddenTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(zone.id, task.id)}
                  className="flex items-center p-3 rounded-xl hover:bg-orange-50/50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                      task.done ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
                    }`}
                  >
                    {task.done && <Check className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-base font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ЭКРАН 3: Фото-Итог и Антифрод */}
          <div className="mt-8 mb-8">
            {photoStatus === 'idle' && (
              <>
                <button
                  onClick={simulatePhoto}
                  disabled={!allDone}
                  className={`w-full ${
                    allDone
                      ? 'bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                      : 'bg-slate-300 cursor-not-allowed'
                  } text-white font-bold text-lg py-5 rounded-2xl transition-all flex items-center justify-center`}
                >
                  <Camera className="w-6 h-6 mr-3" /> Фото-подтверждение зоны
                </button>
                {!allDone && (
                  <p className="text-center text-sm text-slate-500 mt-3 font-medium">
                    Отметьте все пункты чек-листа ({hiddenTasks.filter((t) => !t.done).length} скрытых осталось)
                  </p>
                )}
              </>
            )}

            {photoStatus === 'scanning' && (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center animate-pulse">
                <ScanLine className="w-8 h-8 text-brand-500 mx-auto mb-3 animate-bounce" />
                <p className="font-bold text-slate-800">Анализ метаданных...</p>
                <p className="text-xs text-slate-500 mt-1">Проверка EXIF и GPS координат</p>
              </div>
            )}

            {photoStatus === 'success' && (
              <button
                onClick={() => finishZone(zone.id)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center animate-slide-up"
              >
                <CheckCircle className="w-6 h-6 mr-3" /> Зона проверена. Завершить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}