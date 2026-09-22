import { useEffect } from 'react'
import { AppProvider, useApp } from './store'
import { LoginScreen } from './components/LoginScreen'
import { CleanerApp } from './components/CleanerApp'
import { ManagerDashboard } from './components/ManagerDashboard'
import { DemoMode } from './components/DemoMode'
import { Toasts } from './components/Toasts'

/** true, если приложение открыто внутри iframe (режим демо) */
const isEmbedded = () => typeof window !== 'undefined' && window.self !== window.top

/**
 * Мобильное приложение клинера:
 * — на телефонe заполняет весь экран (без рамки);
 * — на десктопе показывается в рамке телефона по центру.
 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  const embedded = isEmbedded()
  if (embedded) {
    // Внутри iframe демо рамка уже есть — просто заполняем.
    // relative: тосты (absolute) должны оставаться ВНУТРИ рамки, а не уходить
    // в край браузера.
    return <div className="relative h-full w-full bg-white">{children}</div>
  }
  return (
    <div className="h-full w-full bg-white md:bg-slate-200 md:flex md:items-center md:justify-center md:p-6">
      <div className="h-full w-full bg-white md:max-w-[420px] md:max-h-[820px] md:rounded-[2.2rem] md:border-8 md:border-slate-900 md:shadow-2xl md:overflow-hidden relative">
        {/* Камера — только в десктопной рамке */}
        <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-xl z-20 pointer-events-none" />
        {children}
      </div>
    </div>
  )
}

function Router() {
  const { view } = useApp()

  const isCleaner = view === 'cleaner_route' || view === 'cleaner_zone'

  return (
    <div className="w-full h-full relative">
      {view === 'login' && (
        <div className="relative h-full">
          <LoginScreen />
          <Toasts />
        </div>
      )}
      {isCleaner && (
        <PhoneFrame>
          <CleanerApp />
          <Toasts />
        </PhoneFrame>
      )}
      {view === 'manager_dashboard' && (
        <div className="relative h-full">
          <ManagerDashboard />
          <Toasts />
        </div>
      )}
      {view === 'demo' && (
        <div className="relative h-full">
          <DemoMode />
          <Toasts />
        </div>
      )}
    </div>
  )
}

/** Автологин для iframe-режимов демо: ?demo=phone / ?demo=manager */
function DemoBootstrap() {
  const { login } = useApp()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mode = params.get('demo')
    if (mode === 'phone') login('cleaner')
    else if (mode === 'manager') login('manager')
  }, [login])

  return null
}

export default function App() {
  return (
    <AppProvider>
      <DemoBootstrap />
      <Router />
    </AppProvider>
  )
}