<template>
  <div class="billing">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="计费管理" name="billing">
        <el-card>
          <template #header>
            <div class="header-with-search">
              <span>寄存计费列表</span>
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
                <el-select v-model="filterStatus" placeholder="缴费状态" style="width: 120px" clearable>
                  <el-option label="未缴费" value="unpaid" />
                  <el-option label="部分缴费" value="partial" />
                  <el-option label="已结清" value="paid" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table :data="filteredBilling" stripe border>
            <el-table-column prop="bodyName" label="姓名" width="120" />
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="enterTime" label="入柜时间" width="160" />
            <el-table-column label="寄存天数" width="100">
              <template #default="{ row }">
                <el-tag type="info">{{ calculateDays(row) }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="日费率" width="100">
              <template #default="{ row }">
                ¥{{ row.dailyRate }}
              </template>
            </el-table-column>
            <el-table-column label="应缴金额" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ calculateTotal(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="已缴金额" width="120">
              <template #default="{ row }">
                <span class="amount paid">¥{{ row.paidAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="待缴金额" width="120">
              <template #default="{ row }">
                <span :class="['amount', calculateRemaining(row) > 0 ? 'unpaid' : 'paid']">
                  ¥{{ calculateRemaining(row) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="缴费状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : row.status === 'partial' ? 'warning' : 'danger'">
                  {{ row.status === 'paid' ? '已结清' : row.status === 'partial' ? '部分缴费' : '未缴费' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="openPaymentDialog(row)"
                  :disabled="row.status === 'paid'"
                >
                  缴费
                </el-button>
                <el-button size="small" @click="viewBillingDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="超期提醒" name="overdue">
        <el-card>
          <template #header>
            <span>超期寄存提醒</span>
            <el-tag type="danger" size="large">
              共 {{ overdueBodies.length }} 条超期记录
            </el-tag>
          </template>

          <el-alert 
            title="寄存超期说明" 
            type="warning" 
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              遗体寄存最大期限为 <strong>{{ MAX_STORAGE_DAYS }} 天</strong>，超过此期限将自动标记为超期。
              请及时联系家属处理超期遗体，以免产生更多费用。
            </template>
          </el-alert>

          <el-table :data="overdueBodies" stripe border>
            <el-table-column prop="bodyName" label="姓名" width="120" />
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="enterTime" label="入柜时间" width="160" />
            <el-table-column prop="storageDays" label="已寄存" width="100">
              <template #default="{ row }">
                <el-tag type="info">{{ row.storageDays }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="maxDays" label="最大期限" width="100">
              <template #default="{ row }">
                {{ row.maxDays }}天
              </template>
            </el-table-column>
            <el-table-column prop="overdueDays" label="超期天数" width="120">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.overdueDays }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="累计费用" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.storageDays * DAILY_RATE }}</span>
              </template>
            </el-table-column>
            <el-table-column label="通知状态" width="200">
              <template #default="{ row }">
                <div>
                  <el-tag :type="row.notified ? 'success' : 'warning'">
                    {{ row.notified ? '已通知' : '未通知' }}
                  </el-tag>
                  <div v-if="row.notified" class="notify-detail">
                    <span>{{ row.notifyOperator }}</span>
                    <span class="notify-time">{{ row.notifyTime }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="notifyFamily(row)"
                  :disabled="row.notified"
                >
                  {{ row.notified ? '已通知' : '标记已通知' }}
                </el-button>
                <el-button type="danger" size="small" @click="urgentProcess(row)">
                  紧急处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="paymentDialogVisible" title="缴费" width="500px">
      <div v-if="selectedBilling" class="payment-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ selectedBilling.bodyName }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ selectedBilling.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ selectedBilling.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="寄存天数">{{ calculateDays(selectedBilling) }}天</el-descriptions-item>
          <el-descriptions-item label="日费率">¥{{ selectedBilling.dailyRate }}/天</el-descriptions-item>
          <el-descriptions-item label="应缴总额">
            <span class="amount large">¥{{ calculateTotal(selectedBilling) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已缴金额">
            <span class="amount paid">¥{{ selectedBilling.paidAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="本次应缴">
            <span class="amount unpaid large">¥{{ calculateRemaining(selectedBilling) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-form :model="paymentForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="缴费金额">
            <el-input-number 
              v-model="paymentForm.amount" 
              :min="0" 
              :max="calculateRemaining(selectedBilling)"
              :step="100"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="缴费方式">
            <el-radio-group v-model="paymentForm.method">
              <el-radio value="cash">现金</el-radio>
              <el-radio value="wechat">微信</el-radio>
              <el-radio value="alipay">支付宝</el-radio>
              <el-radio value="card">银行卡</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="经办人">
            <el-input v-model="paymentForm.operator" placeholder="请输入经办人姓名" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="paymentForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPayment">确认缴费</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="计费详情" width="600px">
      <div v-if="detailBilling" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ detailBilling.bodyName }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ detailBilling.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ detailBilling.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="出柜时间">{{ detailBilling.exitTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="寄存天数">{{ detailBilling.storageDays }}天</el-descriptions-item>
          <el-descriptions-item label="日费率">¥{{ detailBilling.dailyRate }}/天</el-descriptions-item>
          <el-descriptions-item label="应缴总额">
            <span class="amount">¥{{ detailBilling.totalAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已缴金额">
            <span class="amount paid">¥{{ detailBilling.paidAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待缴金额">
            <span :class="['amount', detailBilling.totalAmount - detailBilling.paidAmount > 0 ? 'unpaid' : 'paid']">
              ¥{{ detailBilling.totalAmount - detailBilling.paidAmount }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="缴费状态">
            <el-tag :type="detailBilling.status === 'paid' ? 'success' : detailBilling.status === 'partial' ? 'warning' : 'danger'">
              {{ detailBilling.status === 'paid' ? '已结清' : detailBilling.status === 'partial' ? '部分缴费' : '未缴费' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailBilling.remarks" label="备注" :span="2">
            {{ detailBilling.remarks }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentBody" class="body-info">
          <el-divider content-position="left">遗体信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="性别">
              {{ currentBody.gender === 'male' ? '男' : currentBody.gender === 'female' ? '女' : '未知' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentBody.age" label="年龄">{{ currentBody.age }}岁</el-descriptions-item>
            <el-descriptions-item label="家属姓名">{{ currentBody.familyName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentBody.familyPhone || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="notifyDialogVisible" title="标记通知家属" width="500px">
      <div v-if="notifyReminder" class="notify-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ notifyReminder.bodyName }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ notifyReminder.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ notifyReminder.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="已寄存">{{ notifyReminder.storageDays }}天</el-descriptions-item>
          <el-descriptions-item label="超期天数">
            <el-tag type="danger">{{ notifyReminder.overdueDays }}天</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-form :model="notifyForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="经办人" required>
            <el-input v-model="notifyForm.operator" placeholder="请输入经办人姓名" />
          </el-form-item>
          <el-form-item label="通知方式">
            <el-select v-model="notifyForm.method" placeholder="请选择通知方式" style="width: 100%">
              <el-option label="电话通知" value="phone" />
              <el-option label="短信通知" value="sms" />
              <el-option label="书面通知" value="written" />
              <el-option label="当面通知" value="inperson" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="notifyForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="notifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNotify">确认标记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { BillingRecord, OverdueReminder } from '@/types'
import dayjs from 'dayjs'
import { DAILY_RATE, MAX_STORAGE_DAYS } from '@/mock/data'

const store = useCabinetStore()

const activeTab = ref('billing')
const searchKeyword = ref('')
const filterStatus = ref('')

const billingRecords = computed(() => store.billingRecords.filter(b => !b.exitTime))
const overdueBodies = computed(() => store.overdueBodies)
const bodies = computed(() => store.bodies)

const filteredBilling = computed(() => {
  let result = [...billingRecords.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(b => 
      b.bodyName.toLowerCase().includes(keyword) || 
      b.cabinetCode.toLowerCase().includes(keyword)
    )
  }
  
  if (filterStatus.value) {
    result = result.filter(b => b.status === filterStatus.value)
  }
  
  return result
})

function calculateDays(record: BillingRecord) {
  if (record.exitTime) {
    return record.storageDays
  }
  const days = dayjs().diff(dayjs(record.enterTime), 'day')
  return days > 0 ? days : 1
}

function calculateTotal(record: BillingRecord) {
  return calculateDays(record) * record.dailyRate
}

function calculateRemaining(record: BillingRecord) {
  return calculateTotal(record) - record.paidAmount
}

const paymentDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const notifyDialogVisible = ref(false)

const selectedBilling = ref<BillingRecord | null>(null)
const detailBilling = ref<BillingRecord | null>(null)
const notifyReminder = ref<OverdueReminder | null>(null)

const currentBody = computed(() => {
  if (!detailBilling.value) return null
  return bodies.value.find(b => b.id === detailBilling.value?.bodyId)
})

const paymentForm = reactive({
  amount: 0,
  method: 'cash' as 'cash' | 'wechat' | 'alipay' | 'card',
  operator: '',
  remarks: ''
})

const notifyForm = reactive({
  operator: '',
  method: 'phone' as 'phone' | 'sms' | 'written' | 'inperson',
  remarks: ''
})

function openPaymentDialog(record: BillingRecord) {
  selectedBilling.value = record
  paymentForm.amount = calculateRemaining(record)
  paymentForm.method = 'cash'
  paymentForm.operator = ''
  paymentForm.remarks = ''
  paymentDialogVisible.value = true
}

function viewBillingDetail(record: BillingRecord) {
  detailBilling.value = record
  detailDialogVisible.value = true
}

function submitPayment() {
  if (!selectedBilling.value) return
  
  if (!paymentForm.operator.trim()) {
    ElMessage.warning('请输入经办人姓名')
    return
  }
  
  if (paymentForm.amount <= 0) {
    ElMessage.warning('请输入有效的缴费金额')
    return
  }
  
  if (paymentForm.amount > calculateRemaining(selectedBilling.value)) {
    ElMessage.warning('缴费金额不能超过待缴金额')
    return
  }
  
  store.updateBillingPayment(selectedBilling.value.id, paymentForm.amount)
  
  ElMessage.success(`缴费成功，已缴费 ¥${paymentForm.amount}`)
  paymentDialogVisible.value = false
}

function notifyFamily(reminder: OverdueReminder) {
  notifyReminder.value = reminder
  notifyForm.operator = ''
  notifyForm.method = 'phone'
  notifyForm.remarks = ''
  notifyDialogVisible.value = true
}

function submitNotify() {
  if (!notifyReminder.value) return
  
  if (!notifyForm.operator.trim()) {
    ElMessage.warning('请输入经办人姓名')
    return
  }
  
  store.markOverdueNotified(notifyReminder.value.bodyId, notifyForm.operator)
  ElMessage.success('已标记为已通知家属')
  notifyDialogVisible.value = false
}

function urgentProcess(reminder: OverdueReminder) {
  ElMessageBox.confirm(
    `确定要对 ${reminder.bodyName} 进行紧急处理吗？\n将转入出柜流程。`,
    '紧急处理确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info('请在交接出柜模块中进行出柜操作')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.billing {
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
  
  &.large {
    font-size: 18px;
  }
  
  &.paid {
    color: #67c23a;
  }
  
  &.unpaid {
    color: #f56c6c;
  }
}

.payment-content,
.detail-content,
.notify-content {
  padding: 10px 0;
}

.body-info {
  margin-top: 20px;
}

.notify-detail {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  display: flex;
  flex-direction: column;
  
  .notify-time {
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 2px;
  }
}
</style>
