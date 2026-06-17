<template>
  <div class="temperature-monitor">
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card class="status-card normal">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="32"><ColdDrink /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ normalCabinets }}</div>
              <div class="card-label">温度正常</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card warning">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ warningCabinets }}</div>
              <div class="card-label">温度预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card danger">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="32"><BellFilled /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ unhandledAlarmCount }}</div>
              <div class="card-label">待处理报警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card :class="['status-card', powerStatus === 'main' ? 'success' : 'warning']">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="32"><Lightning /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ powerStatus === 'main' ? '主电源' : '备用电源' }}</div>
              <div class="card-label">当前供电</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="monitor-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时温度监控</span>
              <el-tag :type="powerStatus === 'main' ? 'success' : 'warning'">
                {{ powerStatus === 'main' ? '主电源正常' : '备用电源运行中' }}
              </el-tag>
            </div>
          </template>
          
          <div ref="allTempChartRef" class="all-temp-chart"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>设备状态</span>
          </template>
          
          <div class="device-list">
            <div 
              v-for="device in devices" 
              :key="device.id" 
              :class="['device-item', device.status]"
            >
              <div class="device-header">
                <span class="device-name">{{ device.name }}</span>
                <el-tag :type="device.status === 'normal' ? 'success' : device.status === 'warning' ? 'warning' : 'danger'" size="small">
                  {{ device.status === 'normal' ? '正常' : device.status === 'warning' ? '预警' : '故障' }}
                </el-tag>
              </div>
              <div class="device-info">
                <div class="info-item">
                  <span class="label">型号:</span>
                  <span class="value">{{ device.model }}</span>
                </div>
                <div class="info-item">
                  <span class="label">温度:</span>
                  <span class="value">{{ device.temperature }}°C</span>
                </div>
                <div class="info-item">
                  <span class="label">湿度:</span>
                  <span class="value">{{ device.humidity }}%</span>
                </div>
                <div class="info-item">
                  <span class="label">电源:</span>
                  <span :class="['value', device.powerStatus]">
                    {{ device.powerStatus === 'main' ? '主电源' : '备用电源' }}
                  </span>
                </div>
              </div>
              <div class="device-dates">
                <span>上次维护: {{ device.lastMaintenanceDate }}</span>
                <span>下次维护: {{ device.nextMaintenanceDate }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <span>备用电源状态</span>
          </template>
          <div class="backup-power">
            <div class="power-indicator">
              <div :class="['power-icon', powerStatus]">
                <el-icon :size="48"><Switch /></el-icon>
              </div>
              <div class="power-status">
                <div class="status-text">{{ powerStatus === 'main' ? '主电源供电' : '备用电源供电' }}</div>
                <div class="status-desc">
                  {{ powerStatus === 'main' ? '电网供电正常，备用电源处于待机状态' : '电网中断，UPS和发电机已启动' }}
                </div>
              </div>
            </div>
            <el-progress 
              :percentage="batteryLevel" 
              :color="batteryLevel > 50 ? '#67c23a' : batteryLevel > 20 ? '#e6a23c' : '#f56c6c'"
              style="margin-top: 15px"
            />
            <div class="battery-info">
              <span>UPS电池容量: {{ batteryLevel }}%</span>
              <span>预计续航: {{ batteryLevel > 50 ? '> 4小时' : batteryLevel > 20 ? '2-4小时' : '< 2小时' }}</span>
            </div>
            <el-button 
              type="primary" 
              style="width: 100%; margin-top: 15px"
              @click="testBackupPower"
            >
              测试备用电源
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>温度报警记录</span>
          <div class="alarm-header-actions">
            <el-radio-group v-model="alarmFilter" size="small" @change="renderCharts">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="unhandled">待处理</el-radio-button>
              <el-radio-button value="handled">已处理</el-radio-button>
            </el-radio-group>
            <el-button type="danger" @click="clearHandledAlarms" :disabled="handledAlarmCount === 0">
              清除已处理
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredAlarms" stripe border>
        <el-table-column prop="cabinetCode" label="柜位" width="100" />
        <el-table-column prop="temperature" label="温度" width="100">
          <template #default="{ row }">
            <span class="alarm-temp">{{ row.temperature }}°C</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmTime" label="报警时间" width="160" />
        <el-table-column label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag type="danger">
              {{ row.alarmType === 'high' ? '温度过高' : '温度过低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.handled ? 'success' : 'warning'">
              {{ row.handled ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理信息" width="180">
          <template #default="{ row }">
            <div v-if="row.handled">
              <div class="handler-info">{{ row.handler }} · {{ row.handleTime }}</div>
              <div v-if="row.remarks" class="handler-remarks">{{ row.remarks }}</div>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              @click="handleAlarm(row)"
              :disabled="row.handled"
            >
              {{ row.handled ? '已处理' : '处理' }}
            </el-button>
            <el-button size="small" @click="viewCabinetChart(row)">
              查看曲线
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="chartDialogVisible" title="温度曲线图" width="900px">
      <div v-if="selectedCabinet" class="chart-dialog">
        <div class="chart-header">
          <span>柜位: {{ selectedCabinet.code }}</span>
          <el-tag :type="selectedCabinet.status === 'fault' ? 'danger' : selectedCabinet.status === 'maintenance' ? 'warning' : 'success'">
            {{ selectedCabinet.status === 'fault' ? '故障' : selectedCabinet.status === 'maintenance' ? '维护中' : '正常' }}
          </el-tag>
          <span>当前温度: <strong :class="selectedCabinet.temperature > -10 || selectedCabinet.temperature < -20 ? 'alarm-temp' : ''">
            {{ selectedCabinet.temperature }}°C
          </strong></span>
        </div>
        <div ref="singleTempChartRef" class="single-temp-chart"></div>
        <div class="chart-actions">
          <el-radio-group v-model="chartHours" @change="renderSingleChart">
            <el-radio-button :value="6">近6小时</el-radio-button>
            <el-radio-button :value="12">近12小时</el-radio-button>
            <el-radio-button :value="24">近24小时</el-radio-button>
            <el-radio-button :value="72">近3天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="alarmDialogVisible" title="处理报警" width="500px">
      <div v-if="selectedAlarm" class="alarm-handle">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="柜位">{{ selectedAlarm.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="报警温度">{{ selectedAlarm.temperature }}°C</el-descriptions-item>
          <el-descriptions-item label="报警时间">{{ selectedAlarm.alarmTime }}</el-descriptions-item>
          <el-descriptions-item label="报警类型">
            {{ selectedAlarm.alarmType === 'high' ? '温度过高' : '温度过低' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-form :model="alarmForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="处理措施">
            <el-select v-model="alarmForm.action" placeholder="请选择处理措施" style="width: 100%">
              <el-option label="已检查，恢复正常" value="checked" />
              <el-option label="转维护处理" value="maintenance" />
              <el-option label="转移遗体到其他柜位" value="transfer" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理人">
            <el-input v-model="alarmForm.operator" placeholder="请输入处理人姓名" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="alarmForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="alarmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAlarmHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ColdDrink, WarningFilled, BellFilled, Lightning, Switch } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { Cabinet, TemperatureAlarm } from '@/types'
import dayjs from 'dayjs'

const store = useCabinetStore()

const cabinets = computed(() => store.cabinets)
const devices = computed(() => store.devices)
const temperatureAlarms = computed(() => store.temperatureAlarms)

const normalCabinets = computed(() => 
  cabinets.value.filter(c => c.temperature >= -20 && c.temperature <= -10).length
)
const warningCabinets = computed(() => 
  cabinets.value.filter(c => (c.temperature > -10 && c.temperature <= -8) || (c.temperature < -20 && c.temperature >= -22)).length
)
const unhandledAlarmCount = computed(() => 
  temperatureAlarms.value.filter(a => !a.handled).length
)
const handledAlarmCount = computed(() => 
  temperatureAlarms.value.filter(a => a.handled).length
)

const powerStatus = ref<'main' | 'backup'>('main')
const batteryLevel = ref(100)

const alarmFilter = ref<'all' | 'unhandled' | 'handled'>('all')
const filteredAlarms = computed(() => {
  if (alarmFilter.value === 'unhandled') {
    return temperatureAlarms.value.filter(a => !a.handled)
  } else if (alarmFilter.value === 'handled') {
    return temperatureAlarms.value.filter(a => a.handled)
  }
  return temperatureAlarms.value
})

const allTempChartRef = ref<HTMLElement | null>(null)
const singleTempChartRef = ref<HTMLElement | null>(null)
let allTempChart: echarts.ECharts | null = null
let singleTempChart: echarts.ECharts | null = null

const chartDialogVisible = ref(false)
const alarmDialogVisible = ref(false)
const selectedCabinet = ref<Cabinet | null>(null)
const selectedAlarm = ref<TemperatureAlarm | null>(null)
const chartHours = ref(24)

const alarmForm = ref({
  action: '',
  operator: '',
  remarks: ''
})

function renderCharts() {
  renderAllTempChart()
}

function renderAllTempChart() {
  if (!allTempChartRef.value) return
  
  if (allTempChart) {
    allTempChart.dispose()
  }
  
  allTempChart = echarts.init(allTempChartRef.value)
  
  const hours = 24
  const times = Array.from({ length: hours }, (_, i) => 
    dayjs().subtract(hours - 1 - i, 'hour').format('HH:00')
  )
  
  const series = cabinets.value.slice(0, 10).map((cabinet, index) => {
    const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#1abc9c', '#e74c3c', '#3498db', '#f39c12']
    const history = store.getCabinetTemperatureHistory(cabinet.id, hours)
    
    return {
      name: cabinet.code,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: colors[index % colors.length]
      },
      data: history.length > 0 ? history.map(h => h.temperature) : Array(hours).fill(cabinet.temperature)
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: series.map(s => s.name),
      type: 'scroll',
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: -25,
      max: -5
    },
    series
  }
  
  allTempChart.setOption(option)
}

function renderSingleChart() {
  if (!singleTempChartRef.value || !selectedCabinet.value) return
  
  if (singleTempChart) {
    singleTempChart.dispose()
  }
  
  singleTempChart = echarts.init(singleTempChartRef.value)
  
  const history = store.getCabinetTemperatureHistory(selectedCabinet.value.id, chartHours.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: history.length > 0 
        ? history.map(h => chartHours.value <= 24 ? h.recordTime.slice(11, 16) : h.recordTime.slice(5, 16))
        : [dayjs().format('HH:mm')]
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: -25,
      max: -5
    },
    series: [{
      name: '温度',
      type: 'line',
      smooth: true,
      data: history.length > 0 ? history.map(h => h.temperature) : [selectedCabinet.value.temperature],
      markLine: {
        silent: true,
        data: [
          { yAxis: -10, lineStyle: { color: 'red', type: 'dashed' }, label: { formatter: '上限 -10°C' } },
          { yAxis: -20, lineStyle: { color: 'blue', type: 'dashed' }, label: { formatter: '下限 -20°C' } }
        ]
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      }
    }]
  }
  
  singleTempChart.setOption(option)
}

function viewCabinetChart(alarm: TemperatureAlarm) {
  const cabinet = cabinets.value.find(c => c.id === alarm.cabinetId)
  if (cabinet) {
    selectedCabinet.value = cabinet
    chartHours.value = 24
    chartDialogVisible.value = true
    nextTick(() => renderSingleChart())
  }
}

function handleAlarm(alarm: TemperatureAlarm) {
  selectedAlarm.value = alarm
  alarmForm.value = {
    action: '',
    operator: '',
    remarks: ''
  }
  alarmDialogVisible.value = true
}

function submitAlarmHandle() {
  if (!alarmForm.value.action || !alarmForm.value.operator) {
    ElMessage.warning('请填写处理措施和处理人')
    return
  }
  
  if (!selectedAlarm.value) return
  
  store.handleTemperatureAlarm(
    selectedAlarm.value.id,
    alarmForm.value.operator,
    alarmForm.value.remarks || alarmForm.value.action
  )
  
  if (alarmForm.value.action === 'maintenance') {
    store.updateCabinetStatus(selectedAlarm.value.cabinetId, 'maintenance')
  } else if (alarmForm.value.action === 'checked') {
    const cabinet = cabinets.value.find(c => c.id === selectedAlarm.value?.cabinetId)
    if (cabinet) {
      store.updateCabinetStatus(
        cabinet.id,
        cabinet.currentBodyId ? 'occupied' : 'empty'
      )
    }
  }
  
  ElMessage.success('报警已处理')
  alarmDialogVisible.value = false
}

function clearHandledAlarms() {
  ElMessageBox.confirm(
    `确定要清除所有已处理的 ${handledAlarmCount.value} 条报警记录吗？未处理的报警不会被删除。`,
    '清除确认',
    {
      confirmButtonText: '确定清除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    store.clearHandledAlarms()
    ElMessage.success(`已清除 ${handledAlarmCount.value} 条已处理报警记录`)
  }).catch(() => {})
}

function testBackupPower() {
  ElMessage.info('正在启动备用电源测试...')
  
  setTimeout(() => {
    powerStatus.value = 'backup'
    batteryLevel.value = 95
    ElMessage.success('备用电源测试完成，切换正常')
    
    setTimeout(() => {
      powerStatus.value = 'main'
      batteryLevel.value = 100
    }, 5000)
  }, 2000)
}

let tempUpdateInterval: ReturnType<typeof setInterval> | null = null

function startTemperatureSimulation() {
  tempUpdateInterval = setInterval(() => {
    store.updateTemperatures()
    renderAllTempChart()
  }, 10000)
}

watch([cabinets, temperatureAlarms], () => {
  if (allTempChart) {
    renderAllTempChart()
  }
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    renderAllTempChart()
  })
  
  startTemperatureSimulation()
  
  window.addEventListener('resize', () => {
    if (allTempChart) allTempChart.resize()
    if (singleTempChart) singleTempChart.resize()
  })
})

onUnmounted(() => {
  if (tempUpdateInterval) {
    clearInterval(tempUpdateInterval)
  }
  if (allTempChart) allTempChart.dispose()
  if (singleTempChart) singleTempChart.dispose()
})
</script>

<style scoped lang="scss">
.temperature-monitor {
  padding: 20px;
}

.overview-row {
  margin-bottom: 20px;
}

.status-card {
  :deep(.el-card__body) {
    padding: 15px;
  }
  
  &.normal {
    border-left: 4px solid #67c23a;
  }
  &.warning {
    border-left: 4px solid #e6a23c;
  }
  &.danger {
    border-left: 4px solid #f56c6c;
  }
  &.success {
    border-left: 4px solid #409eff;
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  .normal & { background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%); }
  .warning & { background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%); }
  .danger & { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }
  .success & { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
}

.card-info {
  .card-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
  .card-label {
    font-size: 13px;
    color: #909399;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alarm-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.all-temp-chart {
  width: 100%;
  height: 350px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-item {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #fafafa;
  
  &.normal {
    border-color: #67c23a;
  }
  &.warning {
    border-color: #e6a23c;
    background: #fdf6ec;
  }
  &.fault {
    border-color: #f56c6c;
    background: #fef0f0;
  }
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  .device-name {
    font-weight: 600;
    font-size: 15px;
  }
}

.device-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    
    .label {
      color: #909399;
    }
    .value {
      font-weight: 500;
      
      &.main { color: #67c23a; }
      &.backup { color: #e6a23c; }
    }
  }
}

.device-dates {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.backup-power {
  .power-indicator {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .power-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.main {
        background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
        color: white;
      }
      &.backup {
        background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%);
        color: white;
        animation: pulse 2s infinite;
      }
    }
    
    .power-status {
      .status-text {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
      .status-desc {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
  
  .battery-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #606266;
    margin-top: 8px;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.alarm-temp {
  color: #f56c6c;
  font-weight: 600;
}

.chart-dialog {
  .chart-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    font-size: 14px;
  }
  
  .single-temp-chart {
    width: 100%;
    height: 400px;
  }
  
  .chart-actions {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }
}

.alarm-handle {
  padding: 10px 0;
}

.handler-info {
  font-size: 12px;
  color: #67c23a;
}

.handler-remarks {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.text-muted {
  color: #c0c4cc;
}

.monitor-row {
  margin-bottom: 20px;
}
</style>
