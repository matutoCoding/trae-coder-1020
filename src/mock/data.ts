import type { Cabinet, BodyInfo, BillingRecord, TemperatureRecord, DeviceInfo, MaintenanceRecord, DisinfectionRecord, TransferRecord, TemperatureAlarm } from '@/types'
import dayjs from 'dayjs'

export const DAILY_RATE = 100
export const MAX_STORAGE_DAYS = 15

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const mockCabinets: Cabinet[] = []
const ROWS = 5
const COLS = 6

for (let row = 1; row <= ROWS; row++) {
  for (let col = 1; col <= COLS; col++) {
    const id = generateId()
    const random = Math.random()
    let status: Cabinet['status'] = 'empty'
    let temperature = -15 + Math.random() * 4 - 2
    
    if (random < 0.6) {
      status = 'occupied'
    } else if (random < 0.75) {
      status = 'empty'
    } else if (random < 0.85) {
      status = 'maintenance'
    } else if (random < 0.92) {
      status = 'fault'
      temperature = -8 + Math.random() * 5
    } else {
      status = 'reserved'
    }

    mockCabinets.push({
      id,
      code: `A${row}-${col.toString().padStart(2, '0')}`,
      row,
      col,
      status,
      temperature: Math.round(temperature * 10) / 10,
      lastCheckTime: dayjs().subtract(Math.random() * 24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      remarks: status === 'maintenance' ? '定期维护中' : status === 'fault' ? '温度异常' : ''
    })
  }
}

export const mockBodies: BodyInfo[] = []
const occupiedCabinets = mockCabinets.filter(c => c.status === 'occupied')

const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '李十三', '张十四', '刘十五', '陈十六', '杨十七', '黄十八', '无名男尸', '无名女尸']
const causes = ['自然死亡', '心脏病', '交通事故', '意外事故', '因病逝世', '猝死']

for (let i = 0; i < occupiedCabinets.length; i++) {
  const cabinet = occupiedCabinets[i]
  const isUnknown = i >= occupiedCabinets.length - 3
  const name = isUnknown ? (Math.random() > 0.5 ? '无名男尸' : '无名女尸') : names[i % names.length]
  const enterDays = Math.floor(Math.random() * 25) + 1
  const deathDays = enterDays + Math.floor(Math.random() * 3)
  
  const body: BodyInfo = {
    id: generateId(),
    name,
    gender: isUnknown ? (name.includes('男') ? 'male' : 'female') : (Math.random() > 0.5 ? 'male' : 'female'),
    age: isUnknown ? undefined : Math.floor(Math.random() * 60) + 20,
    idCard: isUnknown ? undefined : `${Math.floor(Math.random() * 900000 + 100000)}${Math.floor(Math.random() * 90000000 + 10000000)}`,
    isUnknown,
    causeOfDeath: causes[Math.floor(Math.random() * causes.length)],
    deathTime: dayjs().subtract(deathDays, 'day').format('YYYY-MM-DD HH:mm:ss'),
    enterTime: dayjs().subtract(enterDays, 'day').format('YYYY-MM-DD HH:mm:ss'),
    cabinetId: cabinet.id,
    cabinetCode: cabinet.code,
    familyName: isUnknown ? undefined : names[(i + 3) % names.length],
    familyPhone: isUnknown ? undefined : `1${Math.floor(Math.random() * 900000000 + 100000000)}`,
    familyRelation: isUnknown ? undefined : ['配偶', '子女', '父母', '兄弟姐妹'][Math.floor(Math.random() * 4)],
    status: enterDays > MAX_STORAGE_DAYS ? 'overdue' : 'storing',
    remarks: isUnknown ? '待身份确认' : '',
    verifyStatus: Math.random() > 0.2 ? 'verified' : 'pending',
    verifyTime: Math.random() > 0.2 ? dayjs().subtract(enterDays, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
    verifyOperator: Math.random() > 0.2 ? '管理员' : undefined
  }
  
  cabinet.currentBodyId = body.id
  mockBodies.push(body)
}

export const mockBillingRecords: BillingRecord[] = mockBodies.map(body => {
  const days = dayjs().diff(dayjs(body.enterTime), 'day')
  const actualDays = days > 0 ? days : 1
  const total = actualDays * DAILY_RATE
  const paid = Math.random() > 0.3 ? total : (Math.random() > 0.5 ? Math.floor(total / 2) : 0)
  
  return {
    id: generateId(),
    bodyId: body.id,
    bodyName: body.name,
    cabinetCode: body.cabinetCode,
    enterTime: body.enterTime,
    storageDays: actualDays,
    dailyRate: DAILY_RATE,
    totalAmount: total,
    paidAmount: paid,
    status: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
  }
})

export const mockTemperatureRecords: TemperatureRecord[] = []
for (const cabinet of mockCabinets) {
  for (let h = 23; h >= 0; h--) {
    const baseTemp = cabinet.temperature
    const variation = (Math.random() - 0.5) * 2
    const temp = Math.round((baseTemp + variation) * 10) / 10
    const isAbnormal = temp < -20 || temp > -10
    
    mockTemperatureRecords.push({
      id: generateId(),
      cabinetId: cabinet.id,
      cabinetCode: cabinet.code,
      temperature: temp,
      recordTime: dayjs().subtract(h, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      isAbnormal
    })
  }
}

export const mockDevices: DeviceInfo[] = [
  {
    id: generateId(),
    name: '1号制冷机组',
    model: 'ZL-2024-A',
    installDate: '2023-06-15',
    status: 'normal',
    powerStatus: 'main',
    lastMaintenanceDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    nextMaintenanceDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    temperature: -16,
    humidity: 45
  },
  {
    id: generateId(),
    name: '2号制冷机组',
    model: 'ZL-2024-A',
    installDate: '2023-06-15',
    status: 'normal',
    powerStatus: 'main',
    lastMaintenanceDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    nextMaintenanceDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    temperature: -15.5,
    humidity: 48
  },
  {
    id: generateId(),
    name: '备用发电机组',
    model: 'FD-2024-B',
    installDate: '2023-06-20',
    status: 'warning',
    powerStatus: 'backup',
    lastMaintenanceDate: dayjs().subtract(60, 'day').format('YYYY-MM-DD'),
    nextMaintenanceDate: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    temperature: 25,
    humidity: 55
  },
  {
    id: generateId(),
    name: '温度监控系统',
    model: 'JK-2024-C',
    installDate: '2023-07-01',
    status: 'normal',
    powerStatus: 'main',
    lastMaintenanceDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    nextMaintenanceDate: dayjs().add(45, 'day').format('YYYY-MM-DD'),
    temperature: 22,
    humidity: 40
  },
  {
    id: generateId(),
    name: 'UPS电源系统',
    model: 'UPS-2024-D',
    installDate: '2023-07-05',
    status: 'normal',
    powerStatus: 'main',
    lastMaintenanceDate: dayjs().subtract(45, 'day').format('YYYY-MM-DD'),
    nextMaintenanceDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    temperature: 24,
    humidity: 42
  }
]

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: generateId(),
    deviceId: mockDevices[0].id,
    deviceName: mockDevices[0].name,
    type: 'routine',
    operator: '张工',
    startTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD 09:00:00'),
    endTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD 11:30:00'),
    status: 'completed',
    description: '1号制冷机组季度例行维护',
    result: '运行正常，已更换过滤器',
    remarks: '运行状态良好'
  },
  {
    id: generateId(),
    deviceId: mockDevices[2].id,
    deviceName: mockDevices[2].name,
    type: 'routine',
    operator: '李工',
    startTime: dayjs().subtract(60, 'day').format('YYYY-MM-DD 10:00:00'),
    endTime: dayjs().subtract(60, 'day').format('YYYY-MM-DD 14:00:00'),
    status: 'completed',
    description: '备用发电机例行检查和维护',
    result: '启动测试正常，燃油已补充',
    remarks: '建议下次维护更换机油'
  },
  {
    id: generateId(),
    deviceId: mockDevices[0].id,
    deviceName: mockDevices[0].name,
    type: 'repair',
    operator: '王工',
    startTime: dayjs().subtract(15, 'day').format('YYYY-MM-DD 08:30:00'),
    endTime: dayjs().subtract(15, 'day').format('YYYY-MM-DD 12:00:00'),
    status: 'completed',
    description: '压缩机异响维修',
    result: '已更换压缩机轴承，运行正常',
    remarks: ''
  },
  {
    id: generateId(),
    deviceId: mockDevices[3].id,
    deviceName: mockDevices[3].name,
    type: 'routine',
    operator: '赵工',
    startTime: dayjs().format('YYYY-MM-DD 09:00:00'),
    status: 'processing',
    description: '温度监控系统月度校准',
    remarks: ''
  }
]

export const mockDisinfectionRecords: DisinfectionRecord[] = []
for (let i = 0; i < 10; i++) {
  const cabinet = mockCabinets[Math.floor(Math.random() * mockCabinets.length)]
  mockDisinfectionRecords.push({
    id: generateId(),
    cabinetId: cabinet.id,
    cabinetCode: cabinet.code,
    operator: ['李工', '王工', '赵工'][Math.floor(Math.random() * 3)],
    disinfectionTime: dayjs().subtract(i * 2, 'day').format('YYYY-MM-DD 14:00:00'),
    method: ['紫外线消毒', '84消毒液擦拭', '过氧乙酸熏蒸'][Math.floor(Math.random() * 3)],
    duration: [30, 45, 60][Math.floor(Math.random() * 3)],
    remarks: ''
  })
}

export const mockTransferRecords: TransferRecord[] = []
for (let i = 0; i < 8; i++) {
  const name = names[i % names.length]
  const cabinet = mockCabinets[Math.floor(Math.random() * mockCabinets.length)]
  mockTransferRecords.push({
    id: generateId(),
    bodyId: generateId(),
    bodyName: name,
    cabinetId: cabinet.id,
    cabinetCode: cabinet.code,
    transferType: (['cremation', 'family', 'cremation', 'cremation', 'family', 'cremation', 'other', 'cremation'] as const)[i],
    operator: ['管理员', '李主任', '管理员', '王主任', '管理员', '李主任', '管理员', '张主任'][i],
    receiver: ['家属', undefined, '家属', '家属', '兄弟', '家属', '派出所', '家属'][i],
    receiverIdCard: ['110101199001011234', undefined, '310101198505056789', '440101197808084321', '320101199202025678', '510101196512128765', '公检123456', '330101198803033456'][i],
    transferTime: dayjs().subtract(i + 1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    remarks: i === 6 ? '无名尸由派出所处理' : ''
  })
}

export const mockTemperatureAlarms: TemperatureAlarm[] = []
const faultCabinets = mockCabinets.filter(c => c.status === 'fault')
for (let i = 0; i < faultCabinets.length; i++) {
  const cabinet = faultCabinets[i]
  mockTemperatureAlarms.push({
    id: generateId(),
    cabinetId: cabinet.id,
    cabinetCode: cabinet.code,
    temperature: cabinet.temperature,
    alarmTime: dayjs().subtract(i * 2 + 1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    alarmType: cabinet.temperature > -10 ? 'high' : 'low',
    handled: i > 0,
    handleTime: i > 0 ? dayjs().subtract(i * 2, 'hour').format('YYYY-MM-DD HH:mm:ss') : undefined,
    handler: i > 0 ? '管理员' : undefined,
    remarks: i > 0 ? '已修复，温度恢复正常' : '待处理'
  })
}
