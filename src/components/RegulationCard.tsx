import { useState } from 'react'
import { BookOpenCheck, Gauge, SprayCan } from 'lucide-react'
import type { Regulation } from '../types'

type Tab = 'procedure' | 'standards' | 'tools'

const TABS: Array<{ id: Tab; label: string; icon: typeof BookOpenCheck }> = [
  { id: 'procedure', label: 'Как сделать', icon: BookOpenCheck },
  { id: 'standards', label: 'Стандарты', icon: Gauge },
  { id: 'tools', label: 'Средства', icon: SprayCan },
]

interface Props {
  regulation: Regulation
  /** Зона красит регламент в свой цвет: bg-blue-500 / bg-red-500 ... */
  colorClass: string
  /** text-blue-600 ... */
  colorText: string
  /** bg-blue-50 ... */
  lightColor: string
}

/**
 * Регламент зоны (Экран 2: «Уборка и Регламент»).
 * Три вкладки: КАК это сделать → Стандарты → Средства.
 * Подтягивается автоматически из шаблона типа зоны.
 */
export function RegulationCard({ regulation, colorClass, colorText, lightColor }: Props) {
  const [tab, setTab] = useState<Tab>('procedure')

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8 animate-fade-in">
      {/* Шапка карточки */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 min-w-0">
          <span className="bg-brand-500/10 text-brand-700 px-2 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wide flex items-center gap-1 shrink-0">
            <BookOpenCheck className="w-3.5 h-3.5" /> Регламент
          </span>
        </h3>
        <span className="text-xs font-semibold text-slate-400 truncate">
          Как это сделать · стандарты · средства
        </span>
      </div>

      {/* Вкладки */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/70 border-b border-slate-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
              tab === t.id
                ? `${lightColor} ${colorText} shadow-sm ring-1 ring-black/5`
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <t.icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Контент вкладки */}
      <div className="p-2">
        {tab === 'procedure' && (
          <ol className="p-2 space-y-3">
            {regulation.procedure.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span
                  className={`${colorClass} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 shadow-sm`}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {tab === 'standards' && (
          <div className="px-2 py-1">
            {regulation.standards.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm text-slate-500 font-medium shrink-0">{item.label}</span>
                <span className="text-sm font-bold text-slate-800 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'tools' && (
          <div className="px-2 py-1">
            {regulation.tools.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-0"
              >
                <span
                  className={`${colorText} text-xs font-extrabold uppercase tracking-wide shrink-0 flex items-center gap-1.5`}
                >
                  <span className={`${colorClass} w-2 h-2 rounded-full inline-block`} />
                  {item.label}
                </span>
                <span className="text-sm font-medium text-slate-700 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}