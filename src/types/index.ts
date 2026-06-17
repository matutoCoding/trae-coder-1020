export type CabinetStatus = 'empty' | 'occupied' | 'reserved' | 'maintenance' | 'fault'

export interface Cabinet {
  id: string
  code: string
  row: number
  col: number
  status: CabinetStatus
  temperature: number
  currentBodyId?: string
  lastCheckTime: string
  remarks?: string
}

export type BodyStatus = 'storing' | 'picked' | 'unknown' | 'overdue'

export interface BodyInfo {
  id: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  age?: number
  idCard?: string
  isUnknown: boolean
  causeOfDeath?: string
  deathTime: string
  enterTime: string
  cabinetId: string
  cabinetCode: string
  familyName?: string
  familyPhone?: string
  familyRelation?: string
  status: BodyStatus
  remarks?: string
  verifyStatus: 'pending' | 'verified' | 'rejected'
  verifyTime?: string
  verifyOperator?: string
}

export interface BillingRecord {
  id: string
  bodyId: string
  bodyName: string
  cabinetCode: string
  enterTime: string
  exitTime?: string
  storageDays: number
  dailyRate: number
  totalAmount: number
  paidAmount: number
  status: 'unpaid' | 'partial' | 'paid'
  remarks?: string
}

export interface TemperatureRecord {
  id: string
  cabinetId: string
  cabinetCode: string
  temperature: number
  recordTime: string
  isAbnormal: boolean
}

export type DeviceStatus = 'normal' | 'warning' | 'fault'
export type PowerStatus = 'main' | 'backup'

export interface DeviceInfo {
  id: string
  name: string
  model: string
  installDate: string
  status: DeviceStatus
  powerStatus: PowerStatus
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  temperature: number
  humidity: number
  remarks?: string
}

export interface MaintenanceRecord {
  id: string
  deviceId: string
  deviceName: string
  type: 'routine' | 'repair' | 'disinfection'
  operator: string
  startTime: string
  endTime?: string
  status: 'pending' | 'processing' | 'completed'
  description: string
  result?: string
  remarks?: string
}

export interface DisinfectionRecord {
  id: string
  cabinetId: string
  cabinetCode: string
  operator: string
  disinfectionTime: string
  method: string
  duration: number
  remarks?: string
}

export interface TransferRecord {
  id: string
  bodyId: string
  bodyName: string
  cabinetId: string
  cabinetCode: string
  transferType: 'cremation' | 'family' | 'other'
  operator: string
  receiver?: string
  receiverIdCard?: string
  transferTime: string
  remarks?: string
}

export interface StatisticsData {
  totalCabinets: number
  occupiedCabinets: number
  emptyCabinets: number
  maintenanceCabinets: number
  faultCabinets: number
  totalBodies: number
  unknownBodies: number
  overdueBodies: number
  monthlyInCount: number
  monthlyOutCount: number
  turnoverRate: number
  monthlyRevenue: number
}

export interface OverdueReminder {
  id: string
  bodyId: string
  bodyName: string
  cabinetCode: string
  enterTime: string
  storageDays: number
  maxDays: number
  overdueDays: number
  notified: boolean
}

export interface TemperatureAlarm {
  id: string
  cabinetId: string
  cabinetCode: string
  temperature: number
  alarmTime: string
  alarmType: 'high' | 'low'
  handled: boolean
  handleTime?: string
  handler?: string
  remarks?: string
}
