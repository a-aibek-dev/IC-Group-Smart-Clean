import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { PhotoStatus, Toast, View, Zone } from './types'
import { routeFactory, seedCleaner } from './data/mock'

interface AppState {
  view: View
  user: 'cleaner' | 'manager' | null
  cleaner: typeof seedCleaner
  zones: Zone[]
  setZones: (updater: Zone[] | ((prev: Zone[]) => Zone[])) => void
  activeZoneId: string | null
  photoStatus: PhotoStatus
  toasts: Toast[]
  openRoute: () => void
  openZone: (zoneId: string) => void
  backToRoute: () => void
  toggleTask: (zoneId: string, taskId: string) => void
  simulatePhoto: () => void
  finishZone: (zoneId: string) => void
  reorderZones: (direction: 'forward' | 'backward') => void
  login: (role: 'cleaner' | 'manager') => void
  startDemo: () => void
  logout: () => void
  showToast: (text: string, duration?: number) => void
  resetRoute: () => void
}

const Ctx = createContext<AppState | null>(null)

/**
 * Инвариант жёсткого маршрута (Анти-хаос): активен ВСЕГДА первый
 * невыполненный шаг. Вызывается после любого изменения порядка зон
 * (drag&drop, стрелки, получение снапшота) — иначе «актив» прилипает
 * к зоне, а не к первому шагу.
 */
export function withActiveFirst(zones: Zone[]): Zone[] {
  const firstOpen = zones.findIndex((z) => z.status !== 'completed')
  if (firstOpen === -1) return zones // все зоны выполнены
  let changed = false
  const next = zones.map((z, i) => {
    if (z.status === 'completed') return z // выполненные не трогаем
    const want = i === firstOpen ? ('active' as const) : ('locked' as const)
    if (z.status === want) return z
    changed = true
    return { ...z, status: want }
  })
  return changed ? next : zones
}

const SYNC_CHANNEL = 'smart-clean-sync'

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('login')
  const [user, setUser] = useState<'cleaner' | 'manager' | null>(null)
  const [zones, setZonesState] = useState<Zone[]>(routeFactory())
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>('idle')
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  // Live-синхронизация: канал + refs (стабильные ссылки между рендерами)
  const channelRef = useRef<BroadcastChannel | null>(null)
  // selfId для синхронизации. crypto.randomUUID доступен ТОЛЬКО в secure-контексте
  // (https/localhost) — на телефоне по http его нет, поэтому проверяем саму функцию.
  const genId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

  const selfIdRef = useRef<string>(genId())
  // Инициализируем «последним отправленным» снапшотом стартового маршрута.
  // Это не даёт окну при монтировании публиковать factory-порядок поверх
  // чужого состояния: статус приходит через sync-request, а не через publish.
  const lastSentJsonRef = useRef<string>(JSON.stringify(zones))
  const zonesRef = useRef<Zone[]>([])
  zonesRef.current = zones

  const setZones = useCallback((updater: Zone[] | ((prev: Zone[]) => Zone[])) => {
    setZonesState(typeof updater === 'function' ? updater : updater)
  }, [])

  const showToast = useCallback((text: string, duration = 3200) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { text, id }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  // ----- Live-синхронизация: публикация при изменении зон -----
  useEffect(() => {
    const json = JSON.stringify(zones)
    if (json === lastSentJsonRef.current) return
    lastSentJsonRef.current = json
    channelRef.current?.postMessage({ senderId: selfIdRef.current, type: 'zones', zones })
  }, [zones, channelRef, selfIdRef, lastSentJsonRef])

  // ----- Live-синхронизация: приём и применение из других окон -----
  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null
    if (!channel) return
    channelRef.current = channel

    channel.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as { senderId?: string; type?: string; zones?: Zone[] }
      if (!msg || msg.type === undefined) return
      // Игнорируем собственные сообщения
      if (msg.senderId === selfIdRef.current) return

      if (msg.type === 'sync-request') {
        // Отвечаем текущим снапшотом маршрута
        channel.postMessage({ senderId: selfIdRef.current, type: 'zones', zones: zonesRef.current })
        return
      }

      if (msg.type === 'zones' && Array.isArray(msg.zones) && msg.zones.length > 0) {
        const current = zonesRef.current
        // Снапшот идентичен текущему — ничего не делаем (защита от лишних рендеров)
        if (JSON.stringify(msg.zones) === JSON.stringify(current)) return
        // Применяем молча, без toast: уведомление показывает только то окно,
        // где произошло действие (одно уведомление на перестановку).
        // withActiveFirst — страховка: активен первый невыполненный шаг.
        setZonesState(withActiveFirst(msg.zones))
      }
    }

    // Попросить актуальный маршрут у других окон (после загрузки)
    channel.postMessage({ senderId: selfIdRef.current, type: 'sync-request' })

    return () => channel.close()
  }, [showToast, channelRef, selfIdRef, zonesRef])

  const login = useCallback((role: 'cleaner' | 'manager') => {
    // НЕ сбрасываем setZones(routeFactory()) — маршрут принадлежит live-каналу:
    // иначе после logout→login сбрасывался бы и публиковался factory-порядок,
    // затирая перестановки менеджера в других окнах.
    setUser(role)
    setView(role === 'cleaner' ? 'cleaner_route' : 'manager_dashboard')
    setActiveZoneId(null)
    setPhotoStatus('idle')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setView('login')
    setActiveZoneId(null)
    setPhotoStatus('idle')
  }, [])

  const startDemo = useCallback(() => {
    // Не сбрасываем маршрут (см. login) — демо показывает актуальное состояние канала.
    setUser('cleaner')
    setActiveZoneId(null)
    setPhotoStatus('idle')
    setView('demo')
  }, [])

  const resetRoute = useCallback(() => {
    setZones(routeFactory())
    setActiveZoneId(null)
    setPhotoStatus('idle')
  }, [])

  const openZone = useCallback((zoneId: string) => {
    setActiveZoneId(zoneId)
    setPhotoStatus('idle')
    setView('cleaner_zone')
  }, [])

  const backToRoute = useCallback(() => {
    setView('cleaner_route')
    setPhotoStatus('idle')
  }, [])

  const toggleTask = useCallback((zoneId: string, taskId: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, tasks: z.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : z,
      ),
    )
  }, [])

  const simulatePhoto = useCallback(() => {
    setPhotoStatus('scanning')
    setTimeout(() => {
      setPhotoStatus('success')
      showToast('Метаданные подтверждены! Фото подлинное (GPS + EXIF).')
    }, 2000)
  }, [showToast])

  const finishZone = useCallback(
    (zoneId: string) => {
      // Вычисляем новое состояние и текст уведомления вне апдейтера setState
      // (StrictMode вызывает апдейтер дважды — toast дублировался бы).
      const prev = zonesRef.current
      const idx = prev.findIndex((z) => z.id === zoneId)
      if (idx < 0) return

      const next = prev.map((z, i) => (i === idx ? { ...z, status: 'completed' as const } : z))
      let toastText: string
      let duration = 3200
      if (idx + 1 < next.length) {
        next[idx + 1] = { ...next[idx + 1], status: 'active' as const }
        toastText = 'Маршрут обновлен. Переходите к следующей зоне.'
      } else {
        const total = next.reduce((s, z) => s + z.tasks.length, 0)
        const done = next.reduce((s, z) => s + z.tasks.filter((t) => t.done).length, 0)
        const rate = total ? Math.round((done / total) * 100) : 100
        toastText = `Смена завершена на ${rate}%. Отличная работа!`
        duration = 5000
      }

      setZones(next)
      showToast(toastText, duration)
      setPhotoStatus('idle')
      setView('cleaner_route')
    },
    [showToast],
  )

  const reorderZones = useCallback(
    (direction: 'forward' | 'backward') => {
      // Передвигаем активную зону на соседнюю позицию, затем применяем
      // общий инвариант: активна первая невыполненная зона.
      const prev = zonesRef.current
      const activeIdx = prev.findIndex((z) => z.status === 'active')
      if (activeIdx < 0) return

      const target = direction === 'forward' ? activeIdx + 1 : activeIdx - 1
      if (target < 0 || target >= prev.length) return

      const next = [...prev]
      ;[next[activeIdx], next[target]] = [next[target], next[activeIdx]]
      setZones(withActiveFirst(next))
      showToast('Маршрут обновлен: порядок зон изменен.')
    },
    [showToast],
  )

  const value = useMemo<AppState>(
    () => ({
      view,
      user,
      cleaner: seedCleaner,
      zones,
      setZones,
      activeZoneId,
      photoStatus,
      toasts,
      openRoute: () => setView('cleaner_route'),
      openZone,
      backToRoute,
      toggleTask,
      simulatePhoto,
      finishZone,
      reorderZones,
      login,
      startDemo,
      logout,
      showToast,
      resetRoute,
    }),
    [view, user, zones, setZones, activeZoneId, photoStatus, toasts, openZone, backToRoute, toggleTask, simulatePhoto, finishZone, reorderZones, login, startDemo, logout, showToast, resetRoute],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}