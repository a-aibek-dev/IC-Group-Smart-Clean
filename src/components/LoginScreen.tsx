import { Sparkles, Smartphone, LayoutDashboard, MonitorPlay, ChevronRight, Share2 } from 'lucide-react'
import { useApp } from '../store'

export function LoginScreen() {
  const { login, startDemo, cleaner, showToast } = useApp()

  const share = async () => {
    const url = window.location.href
    const data = {
      title: 'IC Group: Smart Clean OS',
      text: 'Смарт-система управления уборкой — посмотрите демо!',
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Ссылка скопирована: ' + url)
      }
    } catch {
      showToast('Ссылка: ' + url)
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 pb-20 bg-slate-900 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#22c55e,#0f172a_60%)]" />
      <div className="z-10 w-full max-w-md space-y-2">
        <Sparkles className="w-16 h-16 text-brand-500 mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="text-4xl font-bold text-white tracking-tight">IC Group</h1>
        <p className="text-slate-400 mb-10 text-lg">Smart Clean OS</p>

        <div className="space-y-4">
          <button
            onClick={() => login('cleaner')}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-between shadow-lg shadow-brand-500/30 group"
          >
            <span className="flex items-center">
              <Smartphone className="w-6 h-6 mr-3" />
              Я — Клинер (Приложение)
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => login('manager')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-2xl border border-slate-700 transition-all flex items-center justify-between"
          >
            <span className="flex items-center">
              <LayoutDashboard className="w-6 h-6 mr-3" />
              Я — Менеджер (Дашборд)
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={startDemo}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-brand-400 font-semibold py-4 px-6 rounded-2xl border border-brand-500/40 transition-all flex items-center justify-between group"
          >
            <span className="flex items-center">
              <MonitorPlay className="w-6 h-6 mr-3" />
              Режим демо (питч)
            </span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mt-6 pt-6 border-t border-slate-800">
          Профиль: <span className="text-slate-300 font-medium">{cleaner.name}</span>, рейтинг{' '}
          <span className="text-brand-400 font-bold">{cleaner.rating}</span>, {cleaner.experienceMonths} мес. стажа · Mock Data
        </p>

        <button
          onClick={share}
          className="mt-3 flex items-center justify-center gap-2 mx-auto text-slate-400 hover:text-brand-400 text-sm font-medium transition-colors py-2 px-4"
        >
          <Share2 className="w-4 h-4" /> Отправить ссылку жюри
        </button>
      </div>
    </div>
  )
}