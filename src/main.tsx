import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/**
 * Error boundary: если на телефоне/в браузере что-то падает,
 * показываем понятную карточку вместо пустого белого экрана.
 */
class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SmartClean] render failed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Упс, что-то пошло не так</p>
            <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>{String(this.state.error.message || this.state.error)}</p>
            <p style={{ fontSize: 13, opacity: 0.5, margin: '16px 0 0' }}>Обновите страницу. Если ошибка повторяется — откройте на десктопе и проверьте консоль.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </StrictMode>,
)