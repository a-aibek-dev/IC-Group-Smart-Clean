import { Phone, Monitor, X, Timer } from 'lucide-react'
import { useApp } from '../store'

/** Режим демо для питча: телефон клинера + дашборд менеджера в одном окне. */
export function DemoMode() {
  const { logout } = useApp()

  const openPhone = () => window.open('/?demo=phone', '_blank')?.focus()

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Timer className="w-5 h-5 text-brand-400 shrink-0" />
          <h1 className="font-bold text-white text-sm sm:text-base truncate">Режим демонстрации для жюри</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openPhone}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <Phone className="w-4 h-4" /> <span className="hidden xs:inline sm:inline">Открыть</span> телефон
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <X className="w-4 h-4" /> Выйти
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-4 sm:gap-8 p-4 sm:p-8 overflow-auto">
        {/* Телефон клинера */}
        <div className="w-full lg:w-[380px] shrink-0 mx-auto lg:mx-0 max-w-[380px]">
          <div className="relative h-[560px] sm:h-[760px] bg-slate-800 rounded-[2.2rem] p-3 shadow-2xl border-4 border-slate-700">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
            <iframe src="/?demo=phone" className="w-full h-full bg-white rounded-[1.8rem] border-0" title="Телефон клинера" />
          </div>
        </div>

        {/* Дашборд (проектор) */}
        <div className="flex-1 min-w-0 lg:min-w-[420px]">
          <div className="flex items-center gap-2 px-4 py-2 text-slate-400 text-xs font-medium">
            <Monitor className="w-4 h-4" /> Большой экран (проектор)
          </div>
          <div className="h-[420px] sm:h-[620px] lg:h-[760px] bg-slate-800 rounded-3xl p-3 shadow-2xl border-4 border-slate-700">
            <iframe src="/?demo=manager" className="w-full h-full bg-slate-50 rounded-2xl border-0" title="Дашборд менеджера" />
          </div>
        </div>
      </div>
    </div>
  )
}