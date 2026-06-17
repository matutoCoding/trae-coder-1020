<template>
  <div class="body-registration">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="入柜登记" name="register">
        <el-card>
          <template #header>
            <span>遗体入柜登记</span>
          </template>
          
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否无名尸">
                  <el-switch v-model="registerForm.isUnknown" @change="onUnknownChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择柜位" prop="cabinetId">
                  <el-select v-model="registerForm.cabinetId" placeholder="请选择空闲柜位" style="width: 100%">
                    <el-option 
                      v-for="cabinet in emptyCabinets" 
                      :key="cabinet.id" 
                      :label="`${cabinet.code} - ${cabinet.temperature}°C`" 
                      :value="cabinet.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">基本信息</el-divider>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="registerForm.name" :disabled="registerForm.isUnknown" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="registerForm.gender">
                    <el-radio value="male">男</el-radio>
                    <el-radio value="female">女</el-radio>
                    <el-radio value="unknown" :disabled="!registerForm.isUnknown">未知</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="年龄">
                  <el-input-number v-model="registerForm.age" :min="0" :max="150" :disabled="registerForm.isUnknown" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="身份证号">
                  <el-input v-model="registerForm.idCard" :disabled="registerForm.isUnknown" placeholder="请输入身份证号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="死亡原因" prop="causeOfDeath">
                  <el-select v-model="registerForm.causeOfDeath" placeholder="请选择死亡原因" style="width: 100%">
                    <el-option label="自然死亡" value="自然死亡" />
                    <el-option label="心脏病" value="心脏病" />
                    <el-option label="交通事故" value="交通事故" />
                    <el-option label="意外事故" value="意外事故" />
                    <el-option label="因病逝世" value="因病逝世" />
                    <el-option label="猝死" value="猝死" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="死亡时间" prop="deathTime">
                  <el-date-picker 
                    v-model="registerForm.deathTime" 
                    type="datetime" 
                    placeholder="选择死亡时间" 
                    style="width: 100%"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="入柜时间" prop="enterTime">
                  <el-date-picker 
                    v-model="registerForm.enterTime" 
                    type="datetime" 
                    placeholder="选择入柜时间" 
                    style="width: 100%"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">家属信息</el-divider>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="家属姓名">
                  <el-input v-model="registerForm.familyName" :disabled="registerForm.isUnknown" placeholder="请输入家属姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系电话">
                  <el-input v-model="registerForm.familyPhone" :disabled="registerForm.isUnknown" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="与死者关系">
                  <el-select v-model="registerForm.familyRelation" :disabled="registerForm.isUnknown" placeholder="请选择关系" style="width: 100%">
                    <el-option label="配偶" value="配偶" />
                    <el-option label="子女" value="子女" />
                    <el-option label="父母" value="父母" />
                    <el-option label="兄弟姐妹" value="兄弟姐妹" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="备注">
              <el-input v-model="registerForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitRegister" :loading="submitting">
                <el-icon><Plus /></el-icon>
                登记入柜
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="身份核对" name="verify">
        <el-card>
          <template #header>
            <div class="header-with-search">
              <span>身份核对列表</span>
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
                <el-select v-model="filterStatus" placeholder="核对状态" style="width: 120px" clearable>
                  <el-option label="待核对" value="pending" />
                  <el-option label="已核对" value="verified" />
                  <el-option label="核对不通过" value="rejected" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table :data="filteredBodies" stripe border>
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
            <el-table-column prop="idCard" label="身份证号" width="180">
              <template #default="{ row }">
                {{ row.idCard || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column prop="enterTime" label="入柜时间" width="160" />
            <el-table-column label="核对状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.verifyStatus === 'verified' ? 'success' : row.verifyStatus === 'rejected' ? 'danger' : 'warning'">
                  {{ row.verifyStatus === 'verified' ? '已核对' : row.verifyStatus === 'rejected' ? '不通过' : '待核对' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="verifyOperator" label="核对人" width="100">
              <template #default="{ row }">
                {{ row.verifyOperator || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.verifyStatus === 'pending'" 
                  type="primary" 
                  size="small" 
                  @click="openVerifyDialog(row)"
                >
                  核对
                </el-button>
                <el-button size="small" @click="viewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredBodies.length"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="verifyDialogVisible" title="身份核对" width="600px">
      <div v-if="verifyBody" class="verify-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ verifyBody.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ verifyBody.gender === 'male' ? '男' : verifyBody.gender === 'female' ? '女' : '未知' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="verifyBody.age" label="年龄">{{ verifyBody.age }}岁</el-descriptions-item>
          <el-descriptions-item v-if="verifyBody.idCard" label="身份证号">{{ verifyBody.idCard }}</el-descriptions-item>
          <el-descriptions-item label="死亡原因">{{ verifyBody.causeOfDeath }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ verifyBody.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="家属姓名">{{ verifyBody.familyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ verifyBody.familyPhone || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="verifyForm" label-width="80px" style="margin-top: 20px">
          <el-form-item label="核对结果">
            <el-radio-group v-model="verifyForm.result">
              <el-radio value="pass">身份信息核对通过</el-radio>
              <el-radio value="reject">身份信息核对不通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="verifyForm.result === 'reject'" label="不通过原因">
            <el-input v-model="verifyForm.reason" type="textarea" :rows="3" placeholder="请输入不通过原因" />
          </el-form-item>
          <el-form-item label="核对人">
            <el-input v-model="verifyForm.operator" placeholder="请输入核对人姓名" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="verifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">确认</el-button>
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
          <el-descriptions-item label="核对状态">
            <el-tag :type="detailBody.verifyStatus === 'verified' ? 'success' : detailBody.verifyStatus === 'rejected' ? 'danger' : 'warning'">
              {{ detailBody.verifyStatus === 'verified' ? '已核对' : detailBody.verifyStatus === 'rejected' ? '不通过' : '待核对' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailBody.verifyTime" label="核对时间">{{ detailBody.verifyTime }}</el-descriptions-item>
          <el-descriptions-item v-if="detailBody.verifyOperator" label="核对人">{{ detailBody.verifyOperator }}</el-descriptions-item>
          <el-descriptions-item v-if="detailBody.remarks" label="备注" :span="2">{{ detailBody.remarks }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import type { BodyInfo } from '@/types'
import dayjs from 'dayjs'

const store = useCabinetStore()

const activeTab = ref('register')
const submitting = ref(false)
const registerFormRef = ref<FormInstance>()

const emptyCabinets = computed(() => store.emptyCabinets)
const bodies = computed(() => store.storingBodies)

const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredBodies = computed(() => {
  let result = [...bodies.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(b => 
      b.name.toLowerCase().includes(keyword) || 
      b.cabinetCode.toLowerCase().includes(keyword)
    )
  }
  
  if (filterStatus.value) {
    result = result.filter(b => b.verifyStatus === filterStatus.value)
  }
  
  return result
})

const registerForm = reactive({
  isUnknown: false,
  name: '',
  gender: 'male' as const,
  age: undefined as number | undefined,
  idCard: '',
  causeOfDeath: '',
  deathTime: '',
  enterTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  cabinetId: '',
  cabinetCode: '',
  familyName: '',
  familyPhone: '',
  familyRelation: '',
  status: 'storing' as const,
  remarks: ''
})

const registerRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  causeOfDeath: [{ required: true, message: '请选择死亡原因', trigger: 'change' }],
  deathTime: [{ required: true, message: '请选择死亡时间', trigger: 'change' }],
  enterTime: [{ required: true, message: '请选择入柜时间', trigger: 'change' }],
  cabinetId: [{ required: true, message: '请选择柜位', trigger: 'change' }]
}

function onUnknownChange(val: boolean) {
  if (val) {
    registerForm.name = '无名尸'
    registerForm.gender = 'unknown'
    registerForm.age = undefined
    registerForm.idCard = ''
    registerForm.familyName = ''
    registerForm.familyPhone = ''
    registerForm.familyRelation = ''
    registerForm.remarks = '待身份确认'
  } else {
    registerForm.name = ''
    registerForm.gender = 'male'
    registerForm.remarks = ''
  }
}

async function submitRegister() {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    
    try {
      const cabinet = emptyCabinets.value.find(c => c.id === registerForm.cabinetId)
      if (!cabinet) {
        ElMessage.error('请选择有效的柜位')
        return
      }
      
      store.addBody({
        name: registerForm.name,
        gender: registerForm.gender,
        age: registerForm.age,
        idCard: registerForm.idCard,
        isUnknown: registerForm.isUnknown,
        causeOfDeath: registerForm.causeOfDeath,
        deathTime: registerForm.deathTime,
        enterTime: registerForm.enterTime,
        cabinetId: registerForm.cabinetId,
        cabinetCode: cabinet.code,
        familyName: registerForm.familyName,
        familyPhone: registerForm.familyPhone,
        familyRelation: registerForm.familyRelation,
        status: 'storing',
        remarks: registerForm.remarks
      })
      
      ElMessage.success('入柜登记成功')
      resetForm()
      activeTab.value = 'verify'
    } catch (error) {
      ElMessage.error('登记失败，请重试')
    } finally {
      submitting.value = false
    }
  })
}

function resetForm() {
  registerFormRef.value?.resetFields()
  registerForm.isUnknown = false
  registerForm.gender = 'male'
  registerForm.enterTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const verifyDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const verifyBody = ref<BodyInfo | null>(null)
const detailBody = ref<BodyInfo | null>(null)

const verifyForm = reactive({
  result: 'pass' as 'pass' | 'reject',
  reason: '',
  operator: ''
})

function openVerifyDialog(body: BodyInfo) {
  verifyBody.value = body
  verifyForm.result = 'pass'
  verifyForm.reason = ''
  verifyForm.operator = ''
  verifyDialogVisible.value = true
}

function viewDetail(body: BodyInfo) {
  detailBody.value = body
  detailDialogVisible.value = true
}

function submitVerify() {
  if (!verifyBody.value) return
  
  if (!verifyForm.operator.trim()) {
    ElMessage.warning('请输入核对人姓名')
    return
  }
  
  if (verifyForm.result === 'reject' && !verifyForm.reason.trim()) {
    ElMessage.warning('请输入不通过原因')
    return
  }
  
  store.verifyBody(verifyBody.value.id, verifyForm.operator, verifyForm.result === 'pass')
  
  ElMessage.success(`身份核对${verifyForm.result === 'pass' ? '通过' : '不通过'}`)
  verifyDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.body-registration {
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

.verify-content,
.detail-content {
  padding: 10px 0;
}
</style>
