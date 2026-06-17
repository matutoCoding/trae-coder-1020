import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Cabinet, BodyInfo, BillingRecord, TemperatureRecord, DeviceInfo, MaintenanceRecord, DisinfectionRecord, TransferRecord, OverdueReminder, StatisticsData, TemperatureAlarm } from '@/types'
import { mockCabinets, mockBodies, mockBillingRecords, mockTemperatureRecords, mockDevices, mockMaintenanceRecords, mockDisinfectionRecords, mockTransferRecords, mockTemperatureAlarms, generateId, DAILY_RATE, MAX_STORAGE_DAYS } from '@/mock/data'
import dayjs from 'dayjs'

export const useCabinetStore = defineStore('cabinet', () => {
  const cabinets = ref<Cabinet[]>(mockCabinets)
  const bodies = ref<BodyInfo[]>(mockBodies)
  const billingRecords = ref<BillingRecord[]>(mockBillingRecords)
  const temperatureRecords = ref<TemperatureRecord[]>(mockTemperatureRecords)
  const devices = ref<DeviceInfo[]>(mockDevices)
  const maintenanceRecords = ref<MaintenanceRecord[]>(mockMaintenanceRecords)
  const disinfectionRecords = ref<DisinfectionRecord[]>(mockDisinfectionRecords)
  const transferRecords = ref<TransferRecord[]>(mockTransferRecords)
  const temperatureAlarms = ref<TemperatureAlarm[]>(mockTemperatureAlarms)

  const occupiedCabinets = computed(() => cabinets.value.filter(c => c.status === 'occupied'))
  const emptyCabinets = computed(() => cabinets.value.filter(c => c.status === 'empty'))
  const faultCabinets = computed(() => cabinets.value.filter(c => c.status === 'fault'))
  const maintenanceCabinets = computed(() => cabinets.value.filter(c => c.status === 'maintenance'))

  const storingBodies = computed(() => bodies.value.filter(b => b.status === 'storing' || b.status === 'overdue'))
  const unknownBodies = computed(() => bodies.value.filter(b => b.isUnknown))
  const overdueBodies = computed(() => {
    return bodies.value.filter(b => {
      if (b.status === 'picked') return false
      const days = dayjs().diff(dayjs(b.enterTime), 'day')
      return days > MAX_STORAGE_DAYS
    }).map(b => ({
      id: generateId(),
      bodyId: b.id,
      bodyName: b.name,
      cabinetCode: b.cabinetCode,
      enterTime: b.enterTime,
      storageDays: dayjs().diff(dayjs(b.enterTime), 'day'),
      maxDays: MAX_STORAGE_DAYS,
      overdueDays: dayjs().diff(dayjs(b.enterTime), 'day') - MAX_STORAGE_DAYS,
      notified: false
    })) as OverdueReminder[]
  })
  const overdueReminders = computed(() => overdueBodies.value)

  const statistics = computed((): StatisticsData => {
    const now = dayjs()
    const startOfMonth = now.startOf('month')
    
    const monthlyIn = bodies.value.filter(b => dayjs(b.enterTime).isAfter(startOfMonth))
    const monthlyOut = transferRecords.value.filter(t => dayjs(t.transferTime).isAfter(startOfMonth))
    
    const monthlyBilling = billingRecords.value.filter(b => 
      dayjs(b.enterTime).isAfter(startOfMonth) || (b.exitTime && dayjs(b.exitTime).isAfter(startOfMonth))
    )

    return {
      totalCabinets: cabinets.value.length,
      occupiedCabinets: occupiedCabinets.value.length,
      emptyCabinets: emptyCabinets.value.length,
      maintenanceCabinets: maintenanceCabinets.value.length,
      faultCabinets: faultCabinets.value.length,
      totalBodies: storingBodies.value.length,
      unknownBodies: unknownBodies.value.length,
      overdueBodies: overdueBodies.value.length,
      monthlyInCount: monthlyIn.length,
      monthlyOutCount: monthlyOut.length,
      turnoverRate: cabinets.value.length > 0 ? Math.round((monthlyOut.length / cabinets.value.length) * 100) / 100 : 0,
      monthlyRevenue: monthlyBilling.reduce((sum, b) => sum + b.paidAmount, 0)
    }
  })

  function addBody(body: Omit<BodyInfo, 'id' | 'verifyStatus'>) {
    const newBody: BodyInfo = {
      ...body,
      id: generateId(),
      verifyStatus: 'pending'
    }
    bodies.value.push(newBody)
    
    const cabinet = cabinets.value.find(c => c.id === body.cabinetId)
    if (cabinet) {
      cabinet.status = 'occupied'
      cabinet.currentBodyId = newBody.id
      cabinet.lastCheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    const days = dayjs().diff(dayjs(body.enterTime), 'day')
    const billing: BillingRecord = {
      id: generateId(),
      bodyId: newBody.id,
      bodyName: body.name,
      cabinetCode: body.cabinetCode,
      enterTime: body.enterTime,
      storageDays: days > 0 ? days : 1,
      dailyRate: DAILY_RATE,
      totalAmount: (days > 0 ? days : 1) * DAILY_RATE,
      paidAmount: 0,
      status: 'unpaid'
    }
    billingRecords.value.push(billing)

    return newBody
  }

  function updateBody(bodyId: string, updates: Partial<BodyInfo>) {
    const index = bodies.value.findIndex(b => b.id === bodyId)
    if (index !== -1) {
      bodies.value[index] = { ...bodies.value[index], ...updates }
    }
  }

  function verifyBody(bodyId: string, operator: string, passed: boolean) {
    const body = bodies.value.find(b => b.id === bodyId)
    if (body) {
      body.verifyStatus = passed ? 'verified' : 'rejected'
      body.verifyTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      body.verifyOperator = operator
    }
  }

  function transferBody(bodyId: string, transferType: 'cremation' | 'family' | 'other', operator: string, receiver?: string, receiverIdCard?: string) {
    const body = bodies.value.find(b => b.id === bodyId)
    if (!body) return null

    body.status = 'picked'
    
    const cabinet = cabinets.value.find(c => c.id === body.cabinetId)
    if (cabinet) {
      cabinet.status = 'empty'
      cabinet.currentBodyId = undefined
      cabinet.lastCheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    const transfer: TransferRecord = {
      id: generateId(),
      bodyId,
      bodyName: body.name,
      cabinetId: body.cabinetId,
      cabinetCode: body.cabinetCode,
      transferType,
      operator,
      receiver,
      receiverIdCard,
      transferTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    transferRecords.value.push(transfer)

    const billing = billingRecords.value.find(b => b.bodyId === bodyId && !b.exitTime)
    if (billing) {
      billing.exitTime = transfer.transferTime
      const days = dayjs(transfer.transferTime).diff(dayjs(billing.enterTime), 'day')
      billing.storageDays = days > 0 ? days : 1
      billing.totalAmount = billing.storageDays * billing.dailyRate
    }

    return transfer
  }

  function updateBillingPayment(billingId: string, amount: number) {
    const billing = billingRecords.value.find(b => b.id === billingId)
    if (billing) {
      billing.paidAmount += amount
      if (billing.paidAmount >= billing.totalAmount) {
        billing.status = 'paid'
      } else if (billing.paidAmount > 0) {
        billing.status = 'partial'
      }
    }
  }

  function addTemperatureRecord(cabinetId: string, temperature: number) {
    const cabinet = cabinets.value.find(c => c.id === cabinetId)
    if (!cabinet) return null

    cabinet.temperature = temperature
    const isAbnormal = temperature < -20 || temperature > -10

    const record: TemperatureRecord = {
      id: generateId(),
      cabinetId,
      cabinetCode: cabinet.code,
      temperature,
      recordTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isAbnormal
    }
    temperatureRecords.value.push(record)

    if (isAbnormal && cabinet.status !== 'fault') {
      cabinet.status = 'fault'
    } else if (!isAbnormal && cabinet.status === 'fault') {
      cabinet.status = cabinet.currentBodyId ? 'occupied' : 'empty'
    }

    return record
  }

  function addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>) {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: generateId()
    }
    maintenanceRecords.value.push(newRecord)
    return newRecord
  }

  function updateMaintenanceRecord(recordId: string, updates: Partial<MaintenanceRecord>) {
    const index = maintenanceRecords.value.findIndex(r => r.id === recordId)
    if (index !== -1) {
      maintenanceRecords.value[index] = { ...maintenanceRecords.value[index], ...updates }
    }
  }

  function addDisinfectionRecord(record: Omit<DisinfectionRecord, 'id'>) {
    const newRecord: DisinfectionRecord = {
      ...record,
      id: generateId()
    }
    disinfectionRecords.value.push(newRecord)

    const cabinet = cabinets.value.find(c => c.id === record.cabinetId)
    if (cabinet) {
      cabinet.lastCheckTime = record.disinfectionTime
    }

    return newRecord
  }

  function updateCabinetStatus(cabinetId: string, status: Cabinet['status']) {
    const cabinet = cabinets.value.find(c => c.id === cabinetId)
    if (cabinet) {
      cabinet.status = status
      cabinet.lastCheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  }

  function updateDeviceStatus(deviceId: string, status: DeviceInfo['status']) {
    const device = devices.value.find(d => d.id === deviceId)
    if (device) {
      device.status = status
    }
  }

  function getCabinetTemperatureHistory(cabinetId: string, hours: number = 24) {
    const startTime = dayjs().subtract(hours, 'hour')
    return temperatureRecords.value
      .filter(r => r.cabinetId === cabinetId && dayjs(r.recordTime).isAfter(startTime))
      .sort((a, b) => dayjs(a.recordTime).valueOf() - dayjs(b.recordTime).valueOf())
  }

  function calculateBilling(bodyId: string): { days: number; total: number; paid: number; remaining: number } {
    const body = bodies.value.find(b => b.id === bodyId)
    if (!body) return { days: 0, total: 0, paid: 0, remaining: 0 }

    const billing = billingRecords.value.find(b => b.bodyId === bodyId && !b.exitTime)
    if (!billing) return { days: 0, total: 0, paid: 0, remaining: 0 }

    const days = dayjs().diff(dayjs(billing.enterTime), 'day')
    const actualDays = days > 0 ? days : 1
    const total = actualDays * billing.dailyRate
    const paid = billing.paidAmount
    const remaining = total - paid

    return { days: actualDays, total, paid, remaining }
  }

  function updateTemperatures() {
    cabinets.value.forEach(cabinet => {
      if (cabinet.status === 'maintenance') return

      const baseTemp = -15
      const variation = (Math.random() - 0.5) * 6
      const newTemp = Math.round((baseTemp + variation) * 10) / 10

      const isAbnormal = newTemp < -20 || newTemp > -10

      cabinet.temperature = newTemp
      cabinet.lastCheckTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

      const record: TemperatureRecord = {
        id: generateId(),
        cabinetId: cabinet.id,
        cabinetCode: cabinet.code,
        temperature: newTemp,
        recordTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isAbnormal
      }
      temperatureRecords.value.push(record)

      if (isAbnormal && cabinet.status !== 'fault') {
        cabinet.status = 'fault'
        const alarm: TemperatureAlarm = {
          id: generateId(),
          cabinetId: cabinet.id,
          cabinetCode: cabinet.code,
          temperature: newTemp,
          alarmTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          alarmType: newTemp > -10 ? 'high' : 'low',
          handled: false
        }
        temperatureAlarms.value.unshift(alarm)
      } else if (!isAbnormal && cabinet.status === 'fault') {
        const pendingAlarm = temperatureAlarms.value.find(
          a => a.cabinetId === cabinet.id && !a.handled
        )
        if (pendingAlarm) {
          handleTemperatureAlarm(pendingAlarm.id, '管理员', '温度自动恢复正常')
        }
        cabinet.status = cabinet.currentBodyId ? 'occupied' : 'empty'
      }
    })
  }

  function handleTemperatureAlarm(alarmId: string, handler: string, remarks?: string) {
    const alarm = temperatureAlarms.value.find(a => a.id === alarmId)
    if (alarm) {
      alarm.handled = true
      alarm.handleTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      alarm.handler = handler
      alarm.remarks = remarks
    }
  }

  return {
    cabinets,
    bodies,
    billingRecords,
    temperatureRecords,
    devices,
    maintenanceRecords,
    disinfectionRecords,
    transferRecords,
    temperatureAlarms,
    occupiedCabinets,
    emptyCabinets,
    faultCabinets,
    maintenanceCabinets,
    storingBodies,
    unknownBodies,
    overdueBodies,
    overdueReminders,
    statistics,
    addBody,
    updateBody,
    verifyBody,
    transferBody,
    updateBillingPayment,
    addTemperatureRecord,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    addDisinfectionRecord,
    updateCabinetStatus,
    updateDeviceStatus,
    getCabinetTemperatureHistory,
    calculateBilling,
    updateTemperatures,
    handleTemperatureAlarm
  }
})
