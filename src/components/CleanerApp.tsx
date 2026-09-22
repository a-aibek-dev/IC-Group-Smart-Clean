import { useApp } from '../store'
import { RouteScreen } from './CleanerRoute'
import { ZoneScreen } from './CleanerZone'

export function CleanerApp() {
  const { view } = useApp()
  return view === 'cleaner_route' ? <RouteScreen /> : <ZoneScreen />
}