<template>
  <div class="equipment-maintenance">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="设备管理" name="device">
        <el-card>
          <template #header>
            <div class="header-with-actions">
              <span>设备列表</span>
              <el-button type="primary" @click="openAddDeviceDialog">
                <el-icon><Plus /></el-icon>
                添加设备
              </el-button>
            </div>
          </template>

          <el-table :data="devices" stripe border>
            <el-table-column prop="name" label="设备名称" width="150" />
            <el-table-column prop="model" label="型号" width="150" />
            <el-table-column prop="installDate" label="安装日期" width="120" />
            <el-table-column label="运行状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'danger'">
                  {{ row.status === 'normal' ? '正常' : row.status === 'warning' ? '预警' : '故障' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="供电状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.powerStatus === 'main' ? 'success' : 'warning'">
                  {{ row.powerStatus === 'main' ? '主电源' : '备用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="temperature" label="温度" width="80">
              <template #default="{ row }">
                {{ row.temperature }}°C
              </template>
            </el-table-column>
            <el-table-column prop="humidity" label="湿度" width="80">
              <template #default="{ row }">
                {{ row.humidity }}%
              </template>
            </el-table-column>
            <el-table-column prop="lastMaintenanceDate" label="上次维护" width="120" />
            <el-table-column prop="nextMaintenanceDate" label="下次维护" width="120">
              <template #default="{ row }">
                <span :class="isOverdue(row.nextMaintenanceDate) ? 'overdue' : ''">
                  {{ row.nextMaintenanceDate }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="openMaintenanceDialog(row)">
                  维保
                </el-button>
                <el-button size="small" @click="viewDeviceDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="维保记录" name="record">
        <el-card>
          <template #header>
            <div class="header-with-actions">
              <span>维保记录</span>
              <div class="search-bar">
                <el-select v-model="filterType" placeholder="维保类型" style="width: 120px" clearable>
                  <el-option label="例行维护" value="routine" />
                  <el-option label="故障维修" value="repair" />
                  <el-option label="消毒" value="disinfection" />
                </el-select>
                <el-select v-model="filterStatus" placeholder="状态" style="width: 120px" clearable>
                  <el-option label="待处理" value="pending" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table :data="filteredRecords" stripe border>
            <el-table-column prop="deviceName" label="设备名称" width="150" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'routine' ? 'primary' : row.type === 'repair' ? 'danger' : 'success'">
                  {{ row.type === 'routine' ? '例行维护' : row.type === 'repair' ? '故障维修' : '消毒' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'warning' : 'info'">
                  {{ row.status === 'completed' ? '已完成' : row.status === 'processing' ? '处理中' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160">
              <template #default="{ row }">
                {{ row.endTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="result" label="结果" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.result || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status !== 'completed'" 
                  size="small" 
                  type="primary" 
                  @click="updateRecordStatus(row)"
                >
                  更新
                </el-button>
                <el-button size="small" @click="viewRecordDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="消杀记录" name="disinfection">
        <el-card>
          <template #header>
            <div class="header-with-actions">
              <span>柜位消杀记录</span>
              <el-button type="primary" @click="openDisinfectionDialog">
                <el-icon><Plus /></el-icon>
                新增消杀
              </el-button>
            </div>
          </template>

          <el-table :data="disinfectionRecords" stripe border>
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="disinfectionTime" label="消杀时间" width="160" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="method" label="消杀方式" width="150" />
            <el-table-column prop="duration" label="时长(分钟)" width="100" />
            <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.remarks || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="deviceDialogVisible" title="设备信息" width="600px">
      <div v-if="selectedDevice" class="device-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ selectedDevice.model }}</el-descriptions-item>
          <el-descriptions-item label="安装日期">{{ selectedDevice.installDate }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">
            <el-tag :type="selectedDevice.status === 'normal' ? 'success' : selectedDevice.status === 'warning' ? 'warning' : 'danger'">
              {{ selectedDevice.status === 'normal' ? '正常' : selectedDevice.status === 'warning' ? '预警' : '故障' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="供电状态">
            <el-tag :type="selectedDevice.powerStatus === 'main' ? 'success' : 'warning'">
              {{ selectedDevice.powerStatus === 'main' ? '主电源' : '备用电源' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前温度">{{ selectedDevice.temperature }}°C</el-descriptions-item>
          <el-descriptions-item label="当前湿度">{{ selectedDevice.humidity }}%</el-descriptions-item>
          <el-descriptions-item label="上次维护">{{ selectedDevice.lastMaintenanceDate }}</el-descriptions-item>
          <el-descriptions-item label="下次维护">{{ selectedDevice.nextMaintenanceDate }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedDevice.remarks" label="备注" :span="2">
            {{ selectedDevice.remarks }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog v-model="maintenanceDialogVisible" title="维保登记" width="600px">
      <div class="maintenance-form">
        <el-form :model="maintenanceForm" :rules="maintenanceRules" ref="maintenanceFormRef" label-width="100px">
          <el-form-item label="设备" prop="deviceId">
            <el-select v-model="maintenanceForm.deviceId" placeholder="请选择设备" style="width: 100%">
              <el-option 
                v-for="device in devices" 
                :key="device.id" 
                :label="device.name" 
                :value="device.id"
                @click="maintenanceForm.deviceName = device.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="维保类型" prop="type">
            <el-radio-group v-model="maintenanceForm.type">
              <el-radio value="routine">例行维护</el-radio>
              <el-radio value="repair">故障维修</el-radio>
              <el-radio value="disinfection">消毒</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="maintenanceForm.status">
              <el-radio value="pending">待处理</el-radio>
              <el-radio value="processing">处理中</el-radio>
              <el-radio value="completed">已完成</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker 
                  v-model="maintenanceForm.startTime" 
                  type="datetime" 
                  placeholder="选择开始时间" 
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间">
                <el-date-picker 
                  v-model="maintenanceForm.endTime" 
                  type="datetime" 
                  placeholder="选择结束时间" 
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="操作人" prop="operator">
            <el-input v-model="maintenanceForm.operator" placeholder="请输入操作人姓名" />
          </el-form-item>
          <el-form-item label="维保描述" prop="description">
            <el-input v-model="maintenanceForm.description" type="textarea" :rows="3" placeholder="请描述维保内容" />
          </el-form-item>
          <el-form-item v-if="maintenanceForm.status === 'completed'" label="处理结果" prop="result">
            <el-input v-model="maintenanceForm.result" type="textarea" :rows="3" placeholder="请描述处理结果" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="maintenanceForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMaintenance">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="disinfectionDialogVisible" title="柜位消杀登记" width="600px">
      <div class="disinfection-form">
        <el-form :model="disinfectionForm" :rules="disinfectionRules" ref="disinfectionFormRef" label-width="100px">
          <el-form-item label="选择柜位" prop="cabinetId">
            <el-select v-model="disinfectionForm.cabinetId" placeholder="请选择柜位" style="width: 100%">
              <el-option 
                v-for="cabinet in cabinets" 
                :key="cabinet.id" 
                :label="cabinet.code" 
                :value="cabinet.id"
                @click="disinfectionForm.cabinetCode = cabinet.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消杀时间" prop="disinfectionTime">
            <el-date-picker 
              v-model="disinfectionForm.disinfectionTime" 
              type="datetime" 
              placeholder="选择消杀时间" 
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="操作人" prop="operator">
            <el-input v-model="disinfectionForm.operator" placeholder="请输入操作人姓名" />
          </el-form-item>
          <el-form-item label="消杀方式" prop="method">
            <el-select v-model="disinfectionForm.method" placeholder="请选择消杀方式" style="width: 100%">
              <el-option label="紫外线消毒" value="紫外线消毒" />
              <el-option label="84消毒液擦拭" value="84消毒液擦拭" />
              <el-option label="过氧乙酸熏蒸" value="过氧乙酸熏蒸" />
              <el-option label="酒精消毒" value="酒精消毒" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="消杀时长(分钟)" prop="duration">
            <el-input-number v-model="disinfectionForm.duration" :min="1" :max="120" style="width: 100%" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="disinfectionForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="disinfectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDisinfection">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordUpdateDialogVisible" title="更新维保状态" width="500px">
      <div v-if="selectedRecord" class="record-update">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="设备">{{ selectedRecord.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ selectedRecord.type === 'routine' ? '例行维护' : selectedRecord.type === 'repair' ? '故障维修' : '消毒' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">{{ selectedRecord.description }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="recordUpdateForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="更新状态">
            <el-radio-group v-model="recordUpdateForm.status">
              <el-radio value="processing">处理中</el-radio>
              <el-radio value="completed">已完成</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="recordUpdateForm.status === 'completed'" label="结束时间">
            <el-date-picker 
              v-model="recordUpdateForm.endTime" 
              type="datetime" 
              placeholder="选择结束时间" 
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item v-if="recordUpdateForm.status === 'completed'" label="处理结果">
            <el-input v-model="recordUpdateForm.result" type="textarea" :rows="3" placeholder="请描述处理结果" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="recordUpdateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecordUpdate">确认更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { DeviceInfo, MaintenanceRecord, DisinfectionRecord } from '@/types'
import dayjs from 'dayjs'

const store = useCabinetStore()

const activeTab = ref('device')
const filterType = ref('')
const filterStatus = ref('')

const devices = computed(() => store.devices)
const cabinets = computed(() => store.cabinets)
const maintenanceRecords = computed(() => 
  [...store.maintenanceRecords].sort((a, b) => dayjs(b.startTime).valueOf() - dayjs(a.startTime).valueOf())
)
const disinfectionRecords = computed(() => 
  [...store.disinfectionRecords].sort((a, b) => dayjs(b.disinfectionTime).valueOf() - dayjs(a.disinfectionTime).valueOf())
)

const filteredRecords = computed(() => {
  let result = [...maintenanceRecords.value]
  
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }
  
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  
  return result
})

function isOverdue(date: string) {
  return dayjs(date).isBefore(dayjs())
}

const deviceDialogVisible = ref(false)
const maintenanceDialogVisible = ref(false)
const disinfectionDialogVisible = ref(false)
const recordUpdateDialogVisible = ref(false)

const selectedDevice = ref<DeviceInfo | null>(null)
const selectedRecord = ref<MaintenanceRecord | null>(null)

const maintenanceFormRef = ref<FormInstance>()
const disinfectionFormRef = ref<FormInstance>()

const maintenanceForm = reactive({
  deviceId: '',
  deviceName: '',
  type: 'routine' as MaintenanceRecord['type'],
  status: 'pending' as MaintenanceRecord['status'],
  operator: '',
  startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  endTime: '',
  description: '',
  result: '',
  remarks: ''
})

const maintenanceRules: FormRules = {
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  type: [{ required: true, message: '请选择维保类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  description: [{ required: true, message: '请输入维保描述', trigger: 'blur' }]
}

const disinfectionForm = reactive({
  cabinetId: '',
  cabinetCode: '',
  operator: '',
  disinfectionTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  method: '',
  duration: 30,
  remarks: ''
})

const disinfectionRules: FormRules = {
  cabinetId: [{ required: true, message: '请选择柜位', trigger: 'change' }],
  disinfectionTime: [{ required: true, message: '请选择消杀时间', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  method: [{ required: true, message: '请选择消杀方式', trigger: 'change' }],
  duration: [{ required: true, message: '请输入消杀时长', trigger: 'blur' }]
}

const recordUpdateForm = reactive({
  status: 'processing' as MaintenanceRecord['status'],
  endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  result: ''
})

function viewDeviceDetail(device: DeviceInfo) {
  selectedDevice.value = device
  deviceDialogVisible.value = true
}

function openAddDeviceDialog() {
  ElMessage.info('添加设备功能待开发')
}

function openMaintenanceDialog(device?: DeviceInfo) {
  if (device) {
    maintenanceForm.deviceId = device.id
    maintenanceForm.deviceName = device.name
  } else {
    maintenanceForm.deviceId = ''
    maintenanceForm.deviceName = ''
  }
  maintenanceForm.type = 'routine'
  maintenanceForm.status = 'pending'
  maintenanceForm.operator = ''
  maintenanceForm.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  maintenanceForm.endTime = ''
  maintenanceForm.description = ''
  maintenanceForm.result = ''
  maintenanceForm.remarks = ''
  maintenanceDialogVisible.value = true
}

async function submitMaintenance() {
  if (!maintenanceFormRef.value) return
  
  await maintenanceFormRef.value.validate((valid) => {
    if (!valid) return
    
    if (!maintenanceForm.deviceName) {
      const device = devices.value.find(d => d.id === maintenanceForm.deviceId)
      if (device) {
        maintenanceForm.deviceName = device.name
      }
    }
    
    store.addMaintenanceRecord({
      deviceId: maintenanceForm.deviceId,
      deviceName: maintenanceForm.deviceName,
      type: maintenanceForm.type,
      operator: maintenanceForm.operator,
      startTime: maintenanceForm.startTime,
      endTime: maintenanceForm.endTime || undefined,
      status: maintenanceForm.status,
      description: maintenanceForm.description,
      result: maintenanceForm.result || undefined,
      remarks: maintenanceForm.remarks || undefined
    })
    
    if (maintenanceForm.status === 'completed' && maintenanceForm.type !== 'disinfection') {
      const device = devices.value.find(d => d.id === maintenanceForm.deviceId)
      if (device) {
        store.updateDeviceStatus(device.id, 'normal')
      }
    }
    
    ElMessage.success('维保记录已添加')
    maintenanceDialogVisible.value = false
    activeTab.value = 'record'
  })
}

function openDisinfectionDialog() {
  disinfectionForm.cabinetId = ''
  disinfectionForm.cabinetCode = ''
  disinfectionForm.operator = ''
  disinfectionForm.disinfectionTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  disinfectionForm.method = ''
  disinfectionForm.duration = 30
  disinfectionForm.remarks = ''
  disinfectionDialogVisible.value = true
}

async function submitDisinfection() {
  if (!disinfectionFormRef.value) return
  
  await disinfectionFormRef.value.validate((valid) => {
    if (!valid) return
    
    if (!disinfectionForm.cabinetCode) {
      const cabinet = cabinets.value.find(c => c.id === disinfectionForm.cabinetId)
      if (cabinet) {
        disinfectionForm.cabinetCode = cabinet.code
      }
    }
    
    store.addDisinfectionRecord({
      cabinetId: disinfectionForm.cabinetId,
      cabinetCode: disinfectionForm.cabinetCode,
      operator: disinfectionForm.operator,
      disinfectionTime: disinfectionForm.disinfectionTime,
      method: disinfectionForm.method,
      duration: disinfectionForm.duration,
      remarks: disinfectionForm.remarks || undefined
    })
    
    store.addMaintenanceRecord({
      deviceId: 'DISINFECTION',
      deviceName: `柜位${disinfectionForm.cabinetCode}消毒`,
      type: 'disinfection',
      operator: disinfectionForm.operator,
      startTime: disinfectionForm.disinfectionTime,
      endTime: dayjs(disinfectionForm.disinfectionTime).add(disinfectionForm.duration, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      status: 'completed',
      description: `${disinfectionForm.method}消毒，时长${disinfectionForm.duration}分钟`,
      result: '消毒完成',
      remarks: disinfectionForm.remarks || undefined
    })
    
    ElMessage.success('消杀记录已添加')
    disinfectionDialogVisible.value = false
  })
}

function updateRecordStatus(record: MaintenanceRecord) {
  selectedRecord.value = record
  recordUpdateForm.status = record.status === 'pending' ? 'processing' : 'completed'
  recordUpdateForm.endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  recordUpdateForm.result = ''
  recordUpdateDialogVisible.value = true
}

function submitRecordUpdate() {
  if (!selectedRecord.value) return
  
  if (recordUpdateForm.status === 'completed' && !recordUpdateForm.result.trim()) {
    ElMessage.warning('请输入处理结果')
    return
  }
  
  store.updateMaintenanceRecord(selectedRecord.value.id, {
    status: recordUpdateForm.status,
    endTime: recordUpdateForm.status === 'completed' ? recordUpdateForm.endTime : undefined,
    result: recordUpdateForm.status === 'completed' ? recordUpdateForm.result : undefined
  })
  
  if (recordUpdateForm.status === 'completed' && selectedRecord.value.type !== 'disinfection') {
    const device = devices.value.find(d => d.id === selectedRecord.value!.deviceId)
    if (device) {
      store.updateDeviceStatus(device.id, 'normal')
    }
  }
  
  ElMessage.success('维保状态已更新')
  recordUpdateDialogVisible.value = false
}

function viewRecordDetail(record: MaintenanceRecord) {
  selectedRecord.value = record
  const device = devices.value.find(d => d.id === record.deviceId)
  if (device) {
    selectedDevice.value = device
    deviceDialogVisible.value = true
  }
}
</script>

<style scoped lang="scss">
.equipment-maintenance {
  padding: 20px;
}

.main-tabs {
  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.overdue {
  color: #f56c6c;
  font-weight: 500;
}

.device-detail,
.maintenance-form,
.disinfection-form,
.record-update {
  padding: 10px 0;
}
</style>
