export type ZoneType = 'blue' | 'yellow' | 'red' | 'green'

export type ZoneStatus = 'completed' | 'active' | 'locked'

export interface Task {
  id: string
  title: string
  done: boolean
  hidden: boolean
  crucial?: boolean
}

export interface Zone {
  id: string
  name: string
  type: ZoneType
  colorClass: string
  lightColor: string
  text: string
  ph: string
  phValue: number
  icon: string
  time: string
  status: ZoneStatus
  tasks: Task[]
  inventoryHint: string
}

export interface Cleaner {
  id: string
  name: string
  rating: number
  experienceMonths: number
  avatar: string
}

export type View =
  | 'login'
  | 'cleaner_route'
  | 'cleaner_zone'
  | 'manager_dashboard'
  | 'demo'

export type PhotoStatus = 'idle' | 'scanning' | 'success'

export interface Toast {
  text: string
  id: number
}