import { Info } from 'lucide-react'
import { useApp } from '../store'
import type { Toast as ToastType } from '../types'

export function Toasts() {
  const { toasts } = useApp()
  if (toasts.length === 0) return null

  return (
    // Тосты — снизу по центру: визуально НЕ перекрывают кнопки «выход» и «назад»
    // (верхние углы экрана). pointer-events-none — страховка, чтобы плашка
    // никогда не блокировала тапы по контенту под ней.
    <div className="absolute inset-x-0 bottom-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {toasts.map((t: ToastType) => (
        <div
          key={t.id}
          className="bg-slate-900/95 backdrop-blur text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center animate-slide-up max-w-full"
        >
          <Info className="w-4 h-4 text-brand-400 mr-3 shrink-0" />
          <span className="font-medium text-sm text-center">{t.text}</span>
        </div>
      ))}
    </div>
  )
}