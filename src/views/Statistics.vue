<template>
  <div class="statistics">
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Refrigerator /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalCabinets }}</div>
              <div class="stat-label">总柜位数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card in">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.monthlyInCount }}</div>
              <div class="stat-label">本月入柜</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card out">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.monthlyOutCount }}</div>
              <div class="stat-label">本月出柜</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card revenue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ statistics.monthlyRevenue }}</div>
              <div class="stat-label">本月收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>柜位状态分布</span>
          </template>
          <div ref="statusPieRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>近7天出入柜统计</span>
          </template>
          <div ref="trendBarRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>月度周转统计</span>
          </template>
          <div ref="turnoverLineRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>死亡原因分布</span>
          </template>
          <div ref="causePieRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="header-with-actions">
          <span>柜位利用率分析</span>
          <div class="actions">
            <el-radio-group v-model="utilizationPeriod" size="small" @change="renderUtilizationChart">
              <el-radio-button value="week">本周</el-radio-button>
              <el-radio-button value="month">本月</el-radio-button>
              <el-radio-button value="year">本年</el-radio-button>
            </el-radio-group>
            <el-button type="primary" size="small" @click="exportReport">
              <el-icon><Download /></el-icon>
              导出报表
            </el-button>
          </div>
        </div>
      </template>
      <div ref="utilizationRef" class="chart-large"></div>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>详细统计数据</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="detail-stat">
            <div class="detail-label">总寄存数</div>
            <div class="detail-value">{{ statistics.totalBodies }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat warning">
            <div class="detail-label">无名遗体</div>
            <div class="detail-value">{{ statistics.unknownBodies }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat danger">
            <div class="detail-label">超期寄存</div>
            <div class="detail-value">{{ statistics.overdueBodies }}</div>
          </div>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="detail-stat">
            <div class="detail-label">已使用柜位</div>
            <div class="detail-value">{{ statistics.occupiedCabinets }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat success">
            <div class="detail-label">空闲柜位</div>
            <div class="detail-value">{{ statistics.emptyCabinets }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat">
            <div class="detail-label">周转率</div>
            <div class="detail-value">{{ (statistics.turnoverRate * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="detail-stat">
            <div class="detail-label">维护中柜位</div>
            <div class="detail-value">{{ statistics.maintenanceCabinets }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat danger">
            <div class="detail-label">故障柜位</div>
            <div class="detail-value">{{ statistics.faultCabinets }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-stat">
            <div class="detail-label">利用率</div>
            <div class="detail-value">
              {{ statistics.utilizationRate }}%
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>寄存时长分布</span>
      </template>
      <div ref="durationRef" class="chart-large"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage } from 'element-plus'
import { Refrigerator, Download, Upload, Money } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const store = useCabinetStore()

const statistics = computed(() => store.statistics)
const bodies = computed(() => store.bodies)
const storingBodies = computed(() => bodies.value.filter(b => b.status !== 'picked'))

const utilizationPeriod = ref('week')

const statusPieRef = ref<HTMLElement | null>(null)
const trendBarRef = ref<HTMLElement | null>(null)
const turnoverLineRef = ref<HTMLElement | null>(null)
const causePieRef = ref<HTMLElement | null>(null)
const utilizationRef = ref<HTMLElement | null>(null)
const durationRef = ref<HTMLElement | null>(null)

let statusPieChart: echarts.ECharts | null = null
let trendBarChart: echarts.ECharts | null = null
let turnoverLineChart: echarts.ECharts | null = null
let causePieChart: echarts.ECharts | null = null
let utilizationChart: echarts.ECharts | null = null
let durationChart: echarts.ECharts | null = null

function renderAllCharts() {
  renderStatusPie()
  renderTrendBar()
  renderTurnoverLine()
  renderCausePie()
  renderUtilizationChart()
  renderDurationChart()
}

function renderStatusPie() {
  if (!statusPieRef.value) return
  
  if (statusPieChart) statusPieChart.dispose()
  statusPieChart = echarts.init(statusPieRef.value)
  
  const data = [
    { value: statistics.value.occupiedCabinets, name: '已使用', itemStyle: { color: '#409eff' } },
    { value: statistics.value.emptyCabinets, name: '空闲', itemStyle: { color: '#67c23a' } },
    { value: statistics.value.maintenanceCabinets, name: '维护中', itemStyle: { color: '#e6a23c' } },
    { value: statistics.value.faultCabinets, name: '故障', itemStyle: { color: '#f56c6c' } }
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      orient: 'horizontal'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data
    }]
  }
  
  statusPieChart.setOption(option)
}

function renderTrendBar() {
  if (!trendBarRef.value) return
  
  if (trendBarChart) trendBarChart.dispose()
  trendBarChart = echarts.init(trendBarRef.value)
  
  const dailyStats = store.getDailyStatistics(7)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
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
      data: dailyStats.map(s => s.date)
    },
    yAxis: {
      type: 'value',
      name: '数量',
      minInterval: 1
    },
    series: [
      {
        name: '入柜',
        type: 'bar',
        data: dailyStats.map(s => s.inCount),
        itemStyle: {
          color: '#409eff'
        },
        barWidth: '35%'
      },
      {
        name: '出柜',
        type: 'bar',
        data: dailyStats.map(s => s.outCount),
        itemStyle: {
          color: '#67c23a'
        },
        barWidth: '35%'
      }
    ]
  }
  
  trendBarChart.setOption(option)
}

function renderTurnoverLine() {
  if (!turnoverLineRef.value) return
  
  if (turnoverLineChart) turnoverLineChart.dispose()
  turnoverLineChart = echarts.init(turnoverLineRef.value)
  
  const monthlyStats = store.getMonthlyStatistics(6)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
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
      data: monthlyStats.map(s => s.month)
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left',
        minInterval: 1
      },
      {
        type: 'value',
        name: '周转率',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '入柜数',
        type: 'line',
        data: monthlyStats.map(s => s.inCount),
        itemStyle: { color: '#409eff' },
        smooth: true
      },
      {
        name: '出柜数',
        type: 'line',
        data: monthlyStats.map(s => s.outCount),
        itemStyle: { color: '#67c23a' },
        smooth: true
      },
      {
        name: '周转率',
        type: 'line',
        yAxisIndex: 1,
        data: monthlyStats.map(s => s.turnoverRate),
        itemStyle: { color: '#f56c6c' },
        smooth: true
      }
    ]
  }
  
  turnoverLineChart.setOption(option)
}

function renderCausePie() {
  if (!causePieRef.value) return
  
  if (causePieChart) causePieChart.dispose()
  causePieChart = echarts.init(causePieRef.value)
  
  const causeCount: Record<string, number> = {}
  bodies.value.forEach(b => {
    const cause = b.causeOfDeath || '其他'
    causeCount[cause] = (causeCount[cause] || 0) + 1
  })
  
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#1abc9c']
  const data = Object.entries(causeCount).map(([name, value], index) => ({
    name,
    value,
    itemStyle: { color: colors[index % colors.length] }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      orient: 'horizontal'
    },
    series: [{
      type: 'pie',
      radius: '60%',
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  causePieChart.setOption(option)
}

function renderUtilizationChart() {
  if (!utilizationRef.value) return
  
  if (utilizationChart) utilizationChart.dispose()
  utilizationChart = echarts.init(utilizationRef.value)
  
  const { labels, data } = store.getUtilizationStatistics(utilizationPeriod.value as 'week' | 'month' | 'year')
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>利用率: {c}%'
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
      data: labels,
      axisLabel: {
        rotate: utilizationPeriod.value === 'month' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '利用率(%)',
      min: 0,
      max: 100
    },
    series: [{
      name: '利用率',
      type: 'line',
      smooth: true,
      data,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      itemStyle: { color: '#409eff' },
      markLine: {
        silent: true,
        data: [
          { yAxis: 60, lineStyle: { color: '#e6a23c', type: 'dashed' }, label: { formatter: '基准 60%' } }
        ]
      }
    }]
  }
  
  utilizationChart.setOption(option)
}

function renderDurationChart() {
  if (!durationRef.value) return
  
  if (durationChart) durationChart.dispose()
  durationChart = echarts.init(durationRef.value)
  
  const ranges = ['1-3天', '4-7天', '8-15天', '16-30天', '31-60天', '60天以上']
  const counts = [0, 0, 0, 0, 0, 0]
  
  storingBodies.value.forEach(body => {
    const days = dayjs().diff(dayjs(body.enterTime), 'day')
    if (days <= 3) counts[0]++
    else if (days <= 7) counts[1]++
    else if (days <= 15) counts[2]++
    else if (days <= 30) counts[3]++
    else if (days <= 60) counts[4]++
    else counts[5]++
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
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
      data: ranges
    },
    yAxis: {
      type: 'value',
      name: '数量',
      minInterval: 1
    },
    series: [{
      type: 'bar',
      data: counts.map((value, index) => ({
        value,
        itemStyle: {
          color: index < 3 ? '#67c23a' : index < 5 ? '#e6a23c' : '#f56c6c'
        }
      })),
      barWidth: '50%',
      label: {
        show: true,
        position: 'top'
      }
    }]
  }
  
  durationChart.setOption(option)
}

function exportReport() {
  ElMessage.success('报表导出功能已触发，正在生成报表...')
  setTimeout(() => {
    ElMessage.success('报表导出成功')
  }, 1500)
}

watch([statistics, bodies, storingBodies], () => {
  nextTick(() => {
    renderAllCharts()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    renderAllCharts()
  })
  
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  if (statusPieChart) statusPieChart.resize()
  if (trendBarChart) trendBarChart.resize()
  if (turnoverLineChart) turnoverLineChart.resize()
  if (causePieChart) causePieChart.resize()
  if (utilizationChart) utilizationChart.resize()
  if (durationChart) durationChart.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (statusPieChart) statusPieChart.dispose()
  if (trendBarChart) trendBarChart.dispose()
  if (turnoverLineChart) turnoverLineChart.dispose()
  if (causePieChart) causePieChart.dispose()
  if (utilizationChart) utilizationChart.dispose()
  if (durationChart) durationChart.dispose()
})
</script>

<style scoped lang="scss">
.statistics {
  padding: 20px;
}

.overview-row {
  margin-bottom: 20px;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 15px;
  }
  
  &.total {
    border-left: 4px solid #667eea;
  }
  &.in {
    border-left: 4px solid #409eff;
  }
  &.out {
    border-left: 4px solid #67c23a;
  }
  &.revenue {
    border-left: 4px solid #f56c6c;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  .total & { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .in & { background: linear-gradient(135deg, #409eff 0%, #337ecc 100%); }
  .out & { background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%); }
  .revenue & { background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%); }
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

.chart-row {
  margin-bottom: 20px;
}

.chart {
  width: 100%;
  height: 300px;
}

.chart-large {
  width: 100%;
  height: 350px;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

.detail-stat {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  
  &.warning {
    background: #fdf6ec;
    .detail-value { color: #e6a23c; }
  }
  
  &.danger {
    background: #fef0f0;
    .detail-value { color: #f56c6c; }
  }
  
  &.success {
    background: #f0f9eb;
    .detail-value { color: #67c23a; }
  }
  
  .detail-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .detail-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
  }
}
</style>
