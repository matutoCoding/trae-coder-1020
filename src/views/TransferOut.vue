<template>
  <div class="transfer-out">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="出柜交接" name="transfer">
        <el-card>
          <template #header>
            <div class="header-with-search">
              <span>待出柜列表</span>
              <div class="search-bar">
                <el-input 
                  v-model="searchKeyword" 
                  placeholder="搜索姓名/柜位" 
                  style="width: 200px" 
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select v-model="filterType" placeholder="类型过滤" style="width: 150px" clearable>
                  <el-option label="普通遗体" value="normal" />
                  <el-option label="无名遗体" value="unknown" />
                  <el-option label="超期寄存" value="overdue" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table :data="filteredBodies" stripe border>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isUnknown" type="danger">无名</el-tag>
                <el-tag v-else-if="row.status === 'overdue'" type="warning">超期</el-tag>
                <el-tag v-else type="info">普通</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column label="性别" width="80">
              <template #default="{ row }">
                {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知' }}
              </template>
            </el-table-column>
            <el-table-column prop="age" label="年龄" width="80">
              <template #default="{ row }">
                {{ row.age ? row.age + '岁' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="enterTime" label="入柜时间" width="160" />
            <el-table-column label="寄存天数" width="100">
              <template #default="{ row }">
                {{ getStorageDays(row) }}天
              </template>
            </el-table-column>
            <el-table-column prop="familyName" label="家属" width="100">
              <template #default="{ row }">
                {{ row.familyName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="费用状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getBillingStatus(row) === 'paid' ? 'success' : getBillingStatus(row) === 'partial' ? 'warning' : 'danger'">
                  {{ getBillingStatus(row) === 'paid' ? '已结清' : getBillingStatus(row) === 'partial' ? '部分' : '未缴' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="openTransferDialog(row)"
                >
                  办理出柜
                </el-button>
                <el-button size="small" @click="viewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="无名遗体管理" name="unknown">
        <el-card>
          <template #header>
            <div class="header-with-search">
              <span>无名遗体列表</span>
              <el-tag type="danger" size="large">
                共 {{ unknownBodies.length }} 具无名遗体
              </el-tag>
            </div>
          </template>

          <el-alert 
            title="无名遗体处理说明" 
            type="warning" 
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              无名遗体需由公安部门出具相关证明后方可处理。
              超过规定期限无人认领的，按相关规定进行火化处理。
            </template>
          </el-alert>

          <el-table :data="unknownBodies" stripe border>
            <el-table-column prop="name" label="暂用名" width="120" />
            <el-table-column label="性别" width="80">
              <template #default="{ row }">
                {{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知' }}
              </template>
            </el-table-column>
            <el-table-column prop="age" label="预估年龄" width="100">
              <template #default="{ row }">
                {{ row.age ? row.age + '岁左右' : '待确认' }}
              </template>
            </el-table-column>
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="enterTime" label="入柜时间" width="160" />
            <el-table-column label="寄存天数" width="100">
              <template #default="{ row }">
                <el-tag :type="getStorageDays(row) > 30 ? 'danger' : 'warning'">
                  {{ getStorageDays(row) }}天
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="causeOfDeath" label="死亡原因" width="120" />
            <el-table-column label="身份确认" width="100">
              <template #default="{ row }">
                <el-tag :type="row.verifyStatus === 'verified' ? 'success' : 'warning'">
                  {{ row.verifyStatus === 'verified' ? '已确认' : '待确认' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="updateIdentity(row)"
                >
                  更新身份
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="processUnknown(row)"
                >
                  处理出柜
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="出柜记录" name="records">
        <el-card>
          <template #header>
            <span>出柜历史记录</span>
          </template>

          <el-table :data="transferRecords" stripe border>
            <el-table-column prop="bodyName" label="姓名" width="120" />
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column label="出柜类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.transferType === 'cremation' ? 'danger' : row.transferType === 'family' ? 'primary' : 'info'">
                  {{ getTransferTypeText(row.transferType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="经办人" width="100" />
            <el-table-column prop="receiver" label="领取人" width="100">
              <template #default="{ row }">
                {{ row.receiver || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="receiverIdCard" label="领取人身份证" width="180">
              <template #default="{ row }">
                {{ row.receiverIdCard || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="transferTime" label="出柜时间" width="160" />
            <el-table-column prop="remarks" label="备注" min-width="150">
              <template #default="{ row }">
                {{ row.remarks || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="transferDialogVisible" title="办理出柜" width="700px">
      <div v-if="selectedBody" class="transfer-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ selectedBody.name }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ selectedBody.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ selectedBody.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="寄存天数">{{ getStorageDays(selectedBody) }}天</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">费用信息</el-divider>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="应缴总额">
            <span class="amount">¥{{ billingInfo.total }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已缴金额">
            <span class="amount paid">¥{{ billingInfo.paid }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待缴金额">
            <span :class="['amount', billingInfo.remaining > 0 ? 'unpaid' : 'paid']">
              ¥{{ billingInfo.remaining }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <el-alert 
          v-if="billingInfo.remaining > 0"
          title="费用未结清" 
          type="warning" 
          :closable="false"
          style="margin: 20px 0"
        >
          请先结清费用后再办理出柜手续。
        </el-alert>

        <el-divider content-position="left">出柜信息</el-divider>
        <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="100px">
          <el-form-item label="出柜类型" prop="transferType">
            <el-radio-group v-model="transferForm.transferType">
              <el-radio value="cremation">火化</el-radio>
              <el-radio value="family">家属领取</el-radio>
              <el-radio value="other">其他</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item 
                v-if="transferForm.transferType === 'family'" 
                label="领取人姓名" 
                prop="receiver"
              >
                <el-input v-model="transferForm.receiver" placeholder="请输入领取人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item 
                v-if="transferForm.transferType === 'family'" 
                label="领取人身份证" 
                prop="receiverIdCard"
              >
                <el-input v-model="transferForm.receiverIdCard" placeholder="请输入领取人身份证号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="经办人" prop="operator">
            <el-input v-model="transferForm.operator" placeholder="请输入经办人姓名" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="transferForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitTransfer"
          :disabled="billingInfo.remaining > 0"
        >
          确认出柜
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="详细信息" width="600px">
      <div v-if="detailBody" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ detailBody.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ detailBody.gender === 'male' ? '男' : detailBody.gender === 'female' ? '女' : '未知' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailBody.age" label="年龄">{{ detailBody.age }}岁</el-descriptions-item>
          <el-descriptions-item v-if="detailBody.idCard" label="身份证号">{{ detailBody.idCard }}</el-descriptions-item>
          <el-descriptions-item label="死亡原因">{{ detailBody.causeOfDeath }}</el-descriptions-item>
          <el-descriptions-item label="死亡时间">{{ detailBody.deathTime }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ detailBody.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ detailBody.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="家属姓名">{{ detailBody.familyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailBody.familyPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="与死者关系">{{ detailBody.familyRelation || '-' }}</el-descriptions-item>
          <el-descriptions-item label="寄存状态">
            <el-tag :type="detailBody.status === 'overdue' ? 'danger' : 'primary'">
              {{ detailBody.status === 'overdue' ? '已超期' : '寄存中' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="身份核对">
            <el-tag :type="detailBody.verifyStatus === 'verified' ? 'success' : detailBody.verifyStatus === 'rejected' ? 'danger' : 'warning'">
              {{ detailBody.verifyStatus === 'verified' ? '已核对' : detailBody.verifyStatus === 'rejected' ? '不通过' : '待核对' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailBody.remarks" label="备注" :span="2">
            {{ detailBody.remarks }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog v-model="identityDialogVisible" title="更新身份信息" width="600px">
      <div v-if="identityBody" class="identity-content">
        <el-form :model="identityForm" :rules="identityRules" ref="identityFormRef" label-width="100px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="identityForm.name" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="identityForm.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年龄" prop="age">
                <el-input-number v-model="identityForm.age" :min="0" :max="150" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="identityForm.idCard" placeholder="请输入身份证号" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="家属姓名">
                <el-input v-model="identityForm.familyName" placeholder="请输入家属姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="identityForm.familyPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="与死者关系">
            <el-select v-model="identityForm.familyRelation" placeholder="请选择关系" style="width: 100%">
              <el-option label="配偶" value="配偶" />
              <el-option label="子女" value="子女" />
              <el-option label="父母" value="父母" />
              <el-option label="兄弟姐妹" value="兄弟姐妹" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="identityForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="identityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIdentity">确认更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { BodyInfo, TransferRecord } from '@/types'
import dayjs from 'dayjs'

const store = useCabinetStore()

const activeTab = ref('transfer')
const searchKeyword = ref('')
const filterType = ref('')

const storingBodies = computed(() => store.storingBodies)
const unknownBodies = computed(() => store.unknownBodies)
const transferRecords = computed(() => [...store.transferRecords].sort((a, b) => 
  dayjs(b.transferTime).valueOf() - dayjs(a.transferTime).valueOf()
))

const filteredBodies = computed(() => {
  let result = [...storingBodies.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(b => 
      b.name.toLowerCase().includes(keyword) || 
      b.cabinetCode.toLowerCase().includes(keyword)
    )
  }
  
  if (filterType.value) {
    switch (filterType.value) {
      case 'normal':
        result = result.filter(b => !b.isUnknown && b.status !== 'overdue')
        break
      case 'unknown':
        result = result.filter(b => b.isUnknown)
        break
      case 'overdue':
        result = result.filter(b => b.status === 'overdue')
        break
    }
  }
  
  return result
})

function getStorageDays(body: BodyInfo) {
  return dayjs().diff(dayjs(body.enterTime), 'day')
}

function getBillingStatus(body: BodyInfo) {
  const billing = store.billingRecords.find(b => b.bodyId === body.id && !b.exitTime)
  return billing?.status || 'unpaid'
}

function getTransferTypeText(type: TransferRecord['transferType']) {
  const map = {
    cremation: '火化',
    family: '家属领取',
    other: '其他'
  }
  return map[type]
}

const transferDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const identityDialogVisible = ref(false)

const selectedBody = ref<BodyInfo | null>(null)
const detailBody = ref<BodyInfo | null>(null)
const identityBody = ref<BodyInfo | null>(null)

const transferFormRef = ref<FormInstance>()
const identityFormRef = ref<FormInstance>()

const billingInfo = computed(() => {
  if (!selectedBody.value) return { days: 0, total: 0, paid: 0, remaining: 0 }
  return store.calculateBilling(selectedBody.value.id)
})

const transferForm = reactive({
  transferType: 'cremation' as TransferRecord['transferType'],
  receiver: '',
  receiverIdCard: '',
  operator: '',
  remarks: ''
})

const transferRules: FormRules = {
  transferType: [{ required: true, message: '请选择出柜类型', trigger: 'change' }],
  operator: [{ required: true, message: '请输入经办人姓名', trigger: 'blur' }]
}

const identityForm = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  age: undefined as number | undefined,
  idCard: '',
  familyName: '',
  familyPhone: '',
  familyRelation: '',
  remarks: ''
})

const identityRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
}

function openTransferDialog(body: BodyInfo) {
  selectedBody.value = body
  transferForm.transferType = 'cremation'
  transferForm.receiver = body.familyName || ''
  transferForm.receiverIdCard = ''
  transferForm.operator = ''
  transferForm.remarks = ''
  transferDialogVisible.value = true
}

function viewDetail(body: BodyInfo) {
  detailBody.value = body
  detailDialogVisible.value = true
}

async function submitTransfer() {
  if (!transferFormRef.value || !selectedBody.value) return
  
  await transferFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (billingInfo.value.remaining > 0) {
      ElMessage.error('请先结清费用后再办理出柜')
      return
    }
    
    ElMessageBox.confirm(
      `确认将 ${selectedBody.value.name} 办理出柜手续吗？`,
      '出柜确认',
      {
        confirmButtonText: '确认出柜',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const transfer = store.transferBody(
        selectedBody.value!.id,
        transferForm.transferType,
        transferForm.operator,
        transferForm.receiver || undefined,
        transferForm.receiverIdCard || undefined
      )
      
      if (transfer) {
        ElMessage.success('出柜手续办理成功')
        transferDialogVisible.value = false
        activeTab.value = 'records'
      }
    }).catch(() => {})
  })
}

function updateIdentity(body: BodyInfo) {
  identityBody.value = body
  identityForm.name = body.name === '无名尸' || body.name === '无名男尸' || body.name === '无名女尸' ? '' : body.name
  identityForm.gender = body.gender === 'unknown' ? 'male' : body.gender
  identityForm.age = body.age
  identityForm.idCard = body.idCard || ''
  identityForm.familyName = body.familyName || ''
  identityForm.familyPhone = body.familyPhone || ''
  identityForm.familyRelation = body.familyRelation || ''
  identityForm.remarks = ''
  identityDialogVisible.value = true
}

async function submitIdentity() {
  if (!identityFormRef.value || !identityBody.value) return
  
  await identityFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    store.updateBody(identityBody.value.id, {
      name: identityForm.name,
      gender: identityForm.gender,
      age: identityForm.age,
      idCard: identityForm.idCard,
      isUnknown: false,
      familyName: identityForm.familyName,
      familyPhone: identityForm.familyPhone,
      familyRelation: identityForm.familyRelation,
      remarks: identityForm.remarks || identityBody.value.remarks,
      verifyStatus: 'verified'
    })
    
    ElMessage.success('身份信息更新成功')
    identityDialogVisible.value = false
  })
}

function processUnknown(body: BodyInfo) {
  ElMessageBox.confirm(
    `确认对无名遗体 ${body.name} 进行出柜处理吗？\n此操作将按无名遗体处理流程进行火化。`,
    '无名遗体处理确认',
    {
      confirmButtonText: '确认处理',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    const transfer = store.transferBody(
      body.id,
      'cremation',
      '系统管理员',
      undefined,
      '公检-无名尸处理'
    )
    
    if (transfer) {
      ElMessage.success('无名遗体已按流程处理')
    }
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.transfer-out {
  padding: 20px;
}

.main-tabs {
  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}

.header-with-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.amount {
  font-weight: 600;
  
  &.paid {
    color: #67c23a;
  }
  
  &.unpaid {
    color: #f56c6c;
  }
}

.transfer-content,
.detail-content,
.identity-content {
  padding: 10px 0;
}
</style>
