<template>
  <div class="cabinet-status">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="32"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCabinets }}</div>
              <div class="stat-label">总柜位</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon occupied">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.occupiedCabinets }}</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon empty">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.emptyCabinets }}</div>
              <div class="stat-label">空闲</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon maintenance">
              <el-icon :size="32"><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.maintenanceCabinets }}</div>
              <div class="stat-label">维护中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon fault">
              <el-icon :size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.faultCabinets }}</div>
              <div class="stat-label">故障</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon overdue">
              <el-icon :size="32"><AlarmClock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.overdueBodies }}</div>
              <div class="stat-label">超期寄存</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="cabinet-grid-card">
      <template #header>
        <div class="card-header">
          <span>冷藏柜位状态图</span>
          <div class="legend">
            <span class="legend-item"><span class="dot occupied"></span>已使用</span>
            <span class="legend-item"><span class="dot empty"></span>空闲</span>
            <span class="legend-item"><span class="dot reserved"></span>预留</span>
            <span class="legend-item"><span class="dot maintenance"></span>维护中</span>
            <span class="legend-item"><span class="dot fault"></span>故障</span>
          </div>
        </div>
      </template>
      
      <div class="cabinet-grid">
        <div v-for="row in maxRow" :key="row" class="cabinet-row">
          <div class="row-label">第{{ row }}排</div>
          <div 
            v-for="col in maxCol" 
            :key="col"
            class="cabinet-cell"
            :class="getCabinetStatus(row, col)"
            @click="handleCabinetClick(row, col)"
          >
            <div class="cabinet-code">{{ getCabinetCode(row, col) }}</div>
            <div class="cabinet-temp">{{ getCabinetTemperature(row, col) }}°C</div>
            <div v-if="isCabinetOccupied(row, col)" class="cabinet-body">
              {{ getCabinetBodyName(row, col) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="柜位详情" width="600px">
      <div v-if="selectedCabinet" class="cabinet-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="柜位编号">{{ selectedCabinet.code }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedCabinet.status)">
              {{ getStatusText(selectedCabinet.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前温度">{{ selectedCabinet.temperature }}°C</el-descriptions-item>
          <el-descriptions-item label="最后检查">{{ selectedCabinet.lastCheckTime }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedCabinet.remarks" label="备注" :span="2">
            {{ selectedCabinet.remarks }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedBody" class="body-info">
          <h4>寄存遗体信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ selectedBody.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ selectedBody.gender === 'male' ? '男' : selectedBody.gender === 'female' ? '女' : '未知' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedBody.age" label="年龄">{{ selectedBody.age }}岁</el-descriptions-item>
            <el-descriptions-item v-if="selectedBody.idCard" label="身份证号">{{ selectedBody.idCard }}</el-descriptions-item>
            <el-descriptions-item label="死亡时间">{{ selectedBody.deathTime }}</el-descriptions-item>
            <el-descriptions-item label="入柜时间">{{ selectedBody.enterTime }}</el-descriptions-item>
            <el-descriptions-item label="身份核对">
              <el-tag :type="selectedBody.verifyStatus === 'verified' ? 'success' : selectedBody.verifyStatus === 'rejected' ? 'danger' : 'warning'">
                {{ selectedBody.verifyStatus === 'verified' ? '已核对' : selectedBody.verifyStatus === 'rejected' ? '核对不通过' : '待核对' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="寄存状态">
              <el-tag :type="selectedBody.status === 'overdue' ? 'danger' : 'primary'">
                {{ selectedBody.status === 'overdue' ? '已超期' : '寄存中' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="viewTemperatureHistory">查看温度曲线</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyVisible" title="温度监控曲线" width="800px">
      <div ref="tempChartRef" class="temp-chart"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage } from 'element-plus'
import { Grid, User, CircleCheck, Tools, Warning, AlarmClock } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { Cabinet, CabinetStatus, BodyInfo } from '@/types'

const store = useCabinetStore()

const statistics = computed(() => store.statistics)
const cabinets = computed(() => store.cabinets)
const bodies = computed(() => store.bodies)

const maxRow = computed(() => Math.max(...cabinets.value.map(c => c.row)))
const maxCol = computed(() => Math.max(...cabinets.value.map(c => c.col)))

const detailVisible = ref(false)
const historyVisible = ref(false)
const selectedCabinet = ref<Cabinet | null>(null)
const selectedBody = ref<BodyInfo | null>(null)
const tempChartRef = ref<HTMLElement | null>(null)
let tempChart: echarts.ECharts | null = null

function getCabinet(row: number, col: number) {
  return cabinets.value.find(c => c.row === row && c.col === col)
}

function getCabinetStatus(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  return cabinet ? cabinet.status : ''
}

function getCabinetCode(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  return cabinet ? cabinet.code : ''
}

function getCabinetTemperature(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  return cabinet ? cabinet.temperature : '--'
}

function isCabinetOccupied(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  return cabinet && cabinet.status === 'occupied'
}

function getCabinetBodyName(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  if (!cabinet || !cabinet.currentBodyId) return ''
  return getBodyInfo(cabinet.currentBodyId)
}

function handleCabinetClick(row: number, col: number) {
  const cabinet = getCabinet(row, col)
  showCabinetDetail(cabinet)
}

function getBodyInfo(bodyId: string) {
  const body = bodies.value.find(b => b.id === bodyId)
  return body ? body.name : ''
}

function getStatusText(status: CabinetStatus) {
  const map: Record<CabinetStatus, string> = {
    empty: '空闲',
    occupied: '已使用',
    reserved: '预留',
    maintenance: '维护中',
    fault: '故障'
  }
  return map[status]
}

function getStatusTagType(status: CabinetStatus) {
  const map: Record<CabinetStatus, '' | 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    empty: 'success',
    occupied: 'primary',
    reserved: 'info',
    maintenance: 'warning',
    fault: 'danger'
  }
  return map[status]
}

function showCabinetDetail(cabinet?: Cabinet) {
  if (!cabinet) return
  selectedCabinet.value = cabinet
  selectedBody.value = cabinet.currentBodyId 
    ? bodies.value.find(b => b.id === cabinet.currentBodyId) || null
    : null
  detailVisible.value = true
}

async function viewTemperatureHistory() {
  if (!selectedCabinet.value) return
  detailVisible.value = false
  historyVisible.value = true
  
  await nextTick()
  renderTemperatureChart()
}

function renderTemperatureChart() {
  if (!tempChartRef.value || !selectedCabinet.value) return
  
  if (tempChart) {
    tempChart.dispose()
  }
  
  tempChart = echarts.init(tempChartRef.value)
  
  const history = store.getCabinetTemperatureHistory(selectedCabinet.value.id, 24)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: history.map(h => h.recordTime.slice(11, 16))
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
      data: history.map(h => h.temperature),
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
  
  tempChart.setOption(option)
}

onMounted(() => {
  window.addEventListener('resize', () => {
    if (tempChart) {
      tempChart.resize()
    }
  })
})
</script>

<style scoped lang="scss">
.cabinet-status {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 15px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  &.occupied { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
  &.empty { background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%); }
  &.maintenance { background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%); }
  &.fault { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }
  &.overdue { background: linear-gradient(135deg, #f56c6c 0%, #d14e4e 100%); }
}

.stat-info {
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
  .stat-label {
    font-size: 13px;
    color: #909399;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.legend {
  display: flex;
  gap: 20px;
  font-size: 13px;
  font-weight: normal;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  
  &.occupied { background: #409eff; }
  &.empty { background: #67c23a; }
  &.reserved { background: #909399; }
  &.maintenance { background: #e6a23c; }
  &.fault { background: #f56c6c; }
}

.cabinet-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cabinet-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-label {
  width: 60px;
  font-weight: 600;
  color: #606266;
}

.cabinet-cell {
  flex: 1;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #dcdfe6;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.occupied {
    background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
    border-color: #409eff;
  }
  
  &.empty {
    background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
    border-color: #67c23a;
  }
  
  &.reserved {
    background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
    border-color: #909399;
  }
  
  &.maintenance {
    background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
    border-color: #e6a23c;
  }
  
  &.fault {
    background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
    border-color: #f56c6c;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.cabinet-code {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.cabinet-temp {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.cabinet-body {
  font-size: 11px;
  color: #606266;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.body-info {
  margin-top: 20px;
  
  h4 {
    margin: 0 0 10px 0;
    color: #303133;
  }
}

.temp-chart {
  width: 100%;
  height: 400px;
}
</style>
