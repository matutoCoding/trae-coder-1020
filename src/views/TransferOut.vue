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
            <el-table-column prop="policeCertNo" label="公安证明号" width="140">
              <template #default="{ row }">
                {{ row.policeCertNo || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="身份确认" width="100">
              <template #default="{ row }">
                <el-tag :type="row.verifyStatus === 'verified' ? 'success' : 'warning'">
                  {{ row.verifyStatus === 'verified' ? '已确认' : '待确认' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
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
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isUnknown" type="danger">无名</el-tag>
                <el-tag v-else type="info">普通</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bodyName" label="姓名" width="120" />
            <el-table-column prop="cabinetCode" label="柜位" width="100" />
            <el-table-column label="出柜类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.transferType === 'cremation' ? 'danger' : row.transferType === 'family' ? 'primary' : 'info'">
                  {{ getTransferTypeText(row.transferType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="费用状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.feeStatus === 'paid' ? 'success' : row.feeStatus === 'partial' ? 'warning' : 'danger'">
                  {{ row.feeStatus === 'paid' ? '已结清' : row.feeStatus === 'partial' ? '部分缴费' : '未缴' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="费用明细" width="160">
              <template #default="{ row }">
                <div v-if="row.totalFee !== undefined">
                  <div>应缴: ¥{{ row.totalFee }}</div>
                  <div>已缴: ¥{{ row.paidFee || 0 }}</div>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="寄存天数" width="90">
              <template #default="{ row }">
                {{ row.storageDays ? row.storageDays + '天' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="经办人" width="100" />
            <el-table-column prop="receiver" label="领取人" width="100">
              <template #default="{ row }">
                {{ row.receiver || (row.processDestination || '-') }}
              </template>
            </el-table-column>
            <el-table-column prop="transferTime" label="出柜时间" width="160" />
            <el-table-column prop="policeCertNo" label="公安证明" width="140">
              <template #default="{ row }">
                {{ row.policeCertNo || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="viewTransferOrder(row)">
                  交接单
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="transferDialogVisible" title="办理出柜" width="750px">
      <div v-if="selectedBody" class="transfer-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="姓名">{{ selectedBody.name }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ selectedBody.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ selectedBody.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="寄存天数">{{ getStorageDays(selectedBody) }}天</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">费用结算</el-divider>
        <el-descriptions :column="3" border size="small">
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
          title="费用未结清，请先完成补缴" 
          type="warning" 
          :closable="false"
          style="margin: 15px 0"
        >
          <div class="quick-pay">
            <el-form inline>
              <el-form-item label="补缴金额">
                <el-input-number 
                  v-model="quickPayAmount" 
                  :min="0" 
                  :max="billingInfo.remaining" 
                  :precision="2"
                />
              </el-form-item>
              <el-form-item label="经办人">
                <el-input v-model="quickPayOperator" placeholder="请输入经办人" style="width: 120px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="quickPay">
                  <el-icon><Money /></el-icon>
                  立即补缴
                </el-button>
                <el-button type="success" @click="quickPayFull">
                  全额补缴
                </el-button>
              </el-form-item>
            </el-form>
          </div>
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
          v-if="billingInfo.remaining <= 0"
          type="warning" 
          @click="previewTransferOrder"
        >
          <el-icon><Document /></el-icon>
          预览交接单
        </el-button>
        <el-button 
          type="primary" 
          @click="submitTransfer"
          :disabled="billingInfo.remaining > 0"
        >
          确认出柜
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="transferOrderVisible" title="交接单预览" width="800px">
      <div ref="transferOrderRef" class="transfer-order">
        <div class="order-header">
          <h2>殡仪馆遗体出柜交接单</h2>
          <div class="order-no">单号：{{ currentTransferOrder?.id || 'PREVIEW' }}</div>
        </div>
        <div class="order-section">
          <div class="section-title">遗体信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="姓名">{{ orderPreviewData.bodyName }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ getGenderText(orderPreviewData.gender) }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ orderPreviewData.age ? orderPreviewData.age + '岁' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ orderPreviewData.idCard || '-' }}</el-descriptions-item>
            <el-descriptions-item label="死亡原因">{{ orderPreviewData.causeOfDeath || '-' }}</el-descriptions-item>
            <el-descriptions-item label="死亡时间">{{ orderPreviewData.deathTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="order-section">
          <div class="section-title">寄存信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="柜位编号">{{ orderPreviewData.cabinetCode }}</el-descriptions-item>
            <el-descriptions-item label="入柜时间">{{ orderPreviewData.enterTime }}</el-descriptions-item>
            <el-descriptions-item label="寄存天数">{{ orderPreviewData.storageDays }}天</el-descriptions-item>
            <el-descriptions-item label="出柜时间">{{ orderPreviewData.transferTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="order-section">
          <div class="section-title">费用明细</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="日费率">¥{{ orderPreviewData.dailyRate }}/天</el-descriptions-item>
            <el-descriptions-item label="应缴总额">¥{{ orderPreviewData.totalFee }}</el-descriptions-item>
            <el-descriptions-item label="已缴金额">¥{{ orderPreviewData.paidFee || 0 }}</el-descriptions-item>
            <el-descriptions-item label="费用状态">
              <el-tag :type="orderPreviewData.feeStatus === 'paid' ? 'success' : orderPreviewData.feeStatus === 'partial' ? 'warning' : 'danger'">
                {{ orderPreviewData.feeStatus === 'paid' ? '已结清' : orderPreviewData.feeStatus === 'partial' ? '部分缴费' : '未缴' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="待缴金额">
              <span class="amount unpaid">¥{{ (orderPreviewData.totalFee || 0) - (orderPreviewData.paidFee || 0) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="order-section">
          <div class="section-title">交接信息</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="出柜类型">
              {{ getTransferTypeText(orderPreviewData.transferType) }}
            </el-descriptions-item>
            <el-descriptions-item label="去向/领取人">
              {{ orderPreviewData.receiver || orderPreviewData.processDestination || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="领取人身份证">
              {{ orderPreviewData.receiverIdCard || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="公安证明号">
              {{ orderPreviewData.policeCertNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="经办人">{{ orderPreviewData.operator }}</el-descriptions-item>
            <el-descriptions-item label="交接时间">{{ orderPreviewData.transferTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="order-section" v-if="orderPreviewData.remarks">
          <div class="section-title">备注</div>
          <div class="remarks-text">{{ orderPreviewData.remarks }}</div>
        </div>
        <div class="order-signatures">
          <div class="sig-item">
            <span>经办人签字：</span>
            <span class="sig-line"></span>
          </div>
          <div class="sig-item">
            <span>领取人签字：</span>
            <span class="sig-line"></span>
          </div>
          <div class="sig-item">
            <span>日期：</span>
            <span class="sig-line"></span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="transferOrderVisible = false">关闭</el-button>
        <el-button type="primary" @click="printTransferOrder">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button type="success" @click="exportTransferOrder">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="详细信息" width="600px">
      <div v-if="detailBody" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ detailBody.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ getGenderText(detailBody.gender) }}
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
          <el-descriptions-item v-if="detailBody.policeCertNo" label="公安证明号">{{ detailBody.policeCertNo }}</el-descriptions-item>
          <el-descriptions-item v-if="detailBody.remarks" label="备注" :span="2">
            {{ detailBody.remarks }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider v-if="detailBody.identityHistory && detailBody.identityHistory.length > 0">
          身份更新历史
        </el-divider>
        <el-timeline v-if="detailBody.identityHistory && detailBody.identityHistory.length > 0">
          <el-timeline-item
            v-for="item in detailBody.identityHistory"
            :key="item.id"
            :timestamp="item.updateTime"
            type="primary"
          >
            <div class="history-item">
              <strong>{{ item.operator }}</strong> 更新 {{ item.fieldName }}：
              {{ item.oldValue }} → <span class="new-value">{{ item.newValue }}</span>
              <span v-if="item.remarks" class="history-remarks">（{{ item.remarks }}）</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog v-model="identityDialogVisible" title="更新身份信息" width="650px">
      <div v-if="identityBody" class="identity-content">
        <el-alert 
          title="更新操作将自动留痕，所有变更将记录操作人、时间和变更内容" 
          type="info" 
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-form :model="identityForm" :rules="identityRules" ref="identityFormRef" label-width="100px">
          <el-form-item label="经办人员" prop="operator">
            <el-input v-model="identityForm.operator" placeholder="请输入您的姓名" />
          </el-form-item>
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
          <el-form-item label="公安证明编号" prop="policeCertNo">
            <el-input v-model="identityForm.policeCertNo" placeholder="请输入公安部门出具的证明编号" />
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
          <el-form-item label="处理去向">
            <el-select v-model="identityForm.processDestination" placeholder="请选择或输入去向" style="width: 100%" filterable allow-create>
              <el-option label="由家属领取" value="由家属领取" />
              <el-option label="火化处理" value="火化处理" />
              <el-option label="移交公安" value="移交公安" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="变更说明">
            <el-input v-model="identityForm.remarks" type="textarea" :rows="2" placeholder="请说明变更原因或备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="identityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIdentity">确认更新</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="unknownProcessVisible" title="无名遗体出柜处理" width="650px">
      <div v-if="unknownProcessBody" class="unknown-process-content">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="暂用名">{{ unknownProcessBody.name }}</el-descriptions-item>
          <el-descriptions-item label="柜位">{{ unknownProcessBody.cabinetCode }}</el-descriptions-item>
          <el-descriptions-item label="入柜时间">{{ unknownProcessBody.enterTime }}</el-descriptions-item>
          <el-descriptions-item label="寄存天数">{{ getStorageDays(unknownProcessBody) }}天</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <el-form :model="unknownProcessForm" :rules="unknownProcessRules" ref="unknownProcessFormRef" label-width="110px">
          <el-form-item label="公安证明编号" prop="policeCertNo">
            <el-input v-model="unknownProcessForm.policeCertNo" placeholder="请输入公安部门证明编号" />
          </el-form-item>
          <el-form-item label="处理去向" prop="processDestination">
            <el-select v-model="unknownProcessForm.processDestination" placeholder="请选择处理去向" style="width: 100%">
              <el-option label="火化处理" value="火化处理" />
              <el-option label="移交公安" value="移交公安" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="经办人员" prop="operator">
            <el-input v-model="unknownProcessForm.operator" placeholder="请输入经办人姓名" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="unknownProcessForm.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="unknownProcessVisible = false">取消</el-button>
        <el-button type="danger" @click="submitUnknownProcess">
          <el-icon><Warning /></el-icon>
          确认处理出柜
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { useCabinetStore } from '@/stores/cabinet'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Money, Document, Printer, Download, Warning } from '@element-plus/icons-vue'
import type { BodyInfo, TransferRecord } from '@/types'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'

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

function getGenderText(gender: string) {
  const map: Record<string, string> = { male: '男', female: '女', unknown: '未知' }
  return map[gender] || '未知'
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
const transferOrderVisible = ref(false)
const unknownProcessVisible = ref(false)

const selectedBody = ref<BodyInfo | null>(null)
const detailBody = ref<BodyInfo | null>(null)
const identityBody = ref<BodyInfo | null>(null)
const unknownProcessBody = ref<BodyInfo | null>(null)
const currentTransferOrder = ref<TransferRecord | null>(null)

const transferOrderRef = ref<HTMLElement | null>(null)

const transferFormRef = ref<FormInstance>()
const identityFormRef = ref<FormInstance>()
const unknownProcessFormRef = ref<FormInstance>()

const quickPayAmount = ref(0)
const quickPayOperator = ref('')

const billingInfo = computed(() => {
  if (!selectedBody.value) return { days: 0, total: 0, paid: 0, remaining: 0 }
  return store.calculateBilling(selectedBody.value.id)
})

const orderPreviewData = reactive<{
  bodyName: string
  gender: string
  age?: number
  idCard?: string
  causeOfDeath?: string
  deathTime: string
  cabinetCode: string
  enterTime: string
  transferTime: string
  storageDays: number
  dailyRate: number
  totalFee?: number
  paidFee?: number
  feeStatus?: 'paid' | 'partial' | 'unpaid'
  transferType: TransferRecord['transferType']
  receiver?: string
  receiverIdCard?: string
  policeCertNo?: string
  processDestination?: string
  operator: string
  remarks?: string
}>({
  bodyName: '',
  gender: 'unknown',
  deathTime: '',
  cabinetCode: '',
  enterTime: '',
  transferTime: '',
  storageDays: 0,
  dailyRate: 50,
  transferType: 'cremation',
  operator: ''
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
  policeCertNo: '',
  familyName: '',
  familyPhone: '',
  familyRelation: '',
  processDestination: '',
  operator: '',
  remarks: ''
})

const identityRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入经办人姓名', trigger: 'blur' }]
}

const unknownProcessForm = reactive({
  policeCertNo: '',
  processDestination: '',
  operator: '',
  remarks: ''
})

const unknownProcessRules: FormRules = {
  policeCertNo: [{ required: true, message: '请输入公安证明编号', trigger: 'blur' }],
  processDestination: [{ required: true, message: '请选择处理去向', trigger: 'change' }],
  operator: [{ required: true, message: '请输入经办人姓名', trigger: 'blur' }]
}

function openTransferDialog(body: BodyInfo) {
  selectedBody.value = body
  transferForm.transferType = 'cremation'
  transferForm.receiver = body.familyName || ''
  transferForm.receiverIdCard = ''
  transferForm.operator = ''
  transferForm.remarks = ''
  quickPayAmount.value = 0
  quickPayOperator.value = ''
  transferDialogVisible.value = true
}

function quickPay() {
  if (!selectedBody.value || !quickPayOperator.value.trim()) {
    ElMessage.warning('请输入经办人姓名')
    return
  }
  if (quickPayAmount.value <= 0) {
    ElMessage.warning('请输入补缴金额')
    return
  }
  
  const billing = store.billingRecords.find(b => b.bodyId === selectedBody.value!.id && !b.exitTime)
  if (billing) {
    store.updateBillingPayment(billing.id, quickPayAmount.value)
    ElMessage.success(`补缴成功 ¥${quickPayAmount.value}`)
    quickPayAmount.value = 0
  }
}

function quickPayFull() {
  if (!selectedBody.value || !quickPayOperator.value.trim()) {
    ElMessage.warning('请输入经办人姓名')
    return
  }
  if (billingInfo.value.remaining <= 0) {
    ElMessage.info('费用已结清')
    return
  }
  
  const billing = store.billingRecords.find(b => b.bodyId === selectedBody.value!.id && !b.exitTime)
  if (billing) {
    store.updateBillingPayment(billing.id, billingInfo.value.remaining)
    ElMessage.success(`全额补缴成功 ¥${billingInfo.value.remaining}`)
    quickPayAmount.value = 0
  }
}

function buildOrderPreviewData(body: BodyInfo, form: typeof transferForm) {
  const billing = store.calculateBilling(body.id)
  const billingRecord = store.billingRecords.find(b => b.bodyId === body.id && !b.exitTime)
  const dailyRate = billingRecord?.dailyRate || billing.total / (billing.days || 1)
  orderPreviewData.bodyName = body.name
  orderPreviewData.gender = body.gender
  orderPreviewData.age = body.age
  orderPreviewData.idCard = body.idCard
  orderPreviewData.causeOfDeath = body.causeOfDeath
  orderPreviewData.deathTime = body.deathTime
  orderPreviewData.cabinetCode = body.cabinetCode
  orderPreviewData.enterTime = body.enterTime
  orderPreviewData.transferTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  orderPreviewData.storageDays = billing.days
  orderPreviewData.dailyRate = dailyRate
  orderPreviewData.totalFee = billing.total
  orderPreviewData.paidFee = billing.paid
  orderPreviewData.feeStatus = billing.remaining <= 0 ? 'paid' : billing.paid > 0 ? 'partial' : 'unpaid'
  orderPreviewData.transferType = form.transferType
  orderPreviewData.receiver = form.receiver || undefined
  orderPreviewData.receiverIdCard = form.receiverIdCard || undefined
  orderPreviewData.policeCertNo = body.policeCertNo
  orderPreviewData.processDestination = body.processDestination
  orderPreviewData.operator = form.operator
  orderPreviewData.remarks = form.remarks || undefined
}

function previewTransferOrder() {
  if (!selectedBody.value) return
  buildOrderPreviewData(selectedBody.value, transferForm)
  currentTransferOrder.value = null
  transferOrderVisible.value = true
}

function viewTransferOrder(record: TransferRecord) {
  currentTransferOrder.value = record
  const body = store.bodies.find(b => b.id === record.bodyId)
  
  orderPreviewData.bodyName = record.bodyName
  orderPreviewData.gender = body?.gender || 'unknown'
  orderPreviewData.age = body?.age
  orderPreviewData.idCard = body?.idCard
  orderPreviewData.causeOfDeath = body?.causeOfDeath
  orderPreviewData.deathTime = body?.deathTime || ''
  orderPreviewData.cabinetCode = record.cabinetCode
  orderPreviewData.enterTime = record.enterTime || body?.enterTime || ''
  orderPreviewData.transferTime = record.transferTime
  orderPreviewData.storageDays = record.storageDays || 0
  orderPreviewData.dailyRate = record.dailyRate || 100
  orderPreviewData.totalFee = record.totalFee
  orderPreviewData.paidFee = record.paidFee
  orderPreviewData.feeStatus = record.feeStatus
  orderPreviewData.transferType = record.transferType
  orderPreviewData.receiver = record.receiver
  orderPreviewData.receiverIdCard = record.receiverIdCard
  orderPreviewData.policeCertNo = record.policeCertNo
  orderPreviewData.processDestination = record.processDestination
  orderPreviewData.operator = record.operator
  orderPreviewData.remarks = record.remarks
  
  transferOrderVisible.value = true
}

function printTransferOrder() {
  if (!transferOrderRef.value) return
  const printContent = transferOrderRef.value.innerHTML
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>出柜交接单</title>
        <style>
          body { font-family: 'Microsoft YaHei', sans-serif; padding: 30px; }
          .order-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .order-header h2 { margin: 0; font-size: 24px; }
          .order-no { margin-top: 10px; font-size: 14px; color: #666; }
          .section-title { font-size: 16px; font-weight: bold; margin: 15px 0 10px; padding-left: 10px; border-left: 4px solid #409eff; }
          :deep(.el-descriptions) { margin-bottom: 10px; }
          .order-signatures { display: flex; justify-content: space-between; margin-top: 40px; padding: 20px 0; }
          .sig-item { flex: 1; display: flex; align-items: center; }
          .sig-line { display: inline-block; width: 150px; border-bottom: 1px solid #333; margin-left: 10px; }
          .remarks-text { padding: 10px; background: #f5f7fa; border-radius: 4px; }
          .amount.unpaid { color: #f56c6c; font-weight: 600; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)
  }
}

async function exportTransferOrder() {
  if (!transferOrderRef.value) return
  
  try {
    ElMessage.info('正在生成交接单图片...')
    const canvas = await html2canvas(transferOrderRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })
    
    const link = document.createElement('a')
    const fileName = `交接单_${orderPreviewData.bodyName}_${dayjs(orderPreviewData.transferTime).format('YYYYMMDDHHmmss')}.png`
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    ElMessage.success('交接单已导出为图片')
  } catch (e) {
    ElMessage.error('导出失败，请重试')
  }
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
    
    const billingSnapshot = store.calculateBilling(selectedBody.value.id)
    const billingRecord = store.billingRecords.find(b => b.bodyId === selectedBody.value!.id && !b.exitTime)
    const dailyRate = billingRecord?.dailyRate || billingSnapshot.total / (billingSnapshot.days || 1)
    
    ElMessageBox.confirm(
      `确认将 ${selectedBody.value.name} 办理出柜手续吗？\n将生成出柜交接单并更新柜位状态。`,
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
        transferForm.receiverIdCard || undefined,
        transferForm.remarks || undefined
      )
      
      if (transfer) {
        ElMessage.success('出柜手续办理成功')
        currentTransferOrder.value = transfer
        transferDialogVisible.value = false
        
        orderPreviewData.bodyName = selectedBody.value!.name
        orderPreviewData.gender = selectedBody.value!.gender
        orderPreviewData.age = selectedBody.value!.age
        orderPreviewData.idCard = selectedBody.value!.idCard
        orderPreviewData.causeOfDeath = selectedBody.value!.causeOfDeath
        orderPreviewData.deathTime = selectedBody.value!.deathTime
        orderPreviewData.cabinetCode = selectedBody.value!.cabinetCode
        orderPreviewData.enterTime = selectedBody.value!.enterTime
        orderPreviewData.transferTime = transfer.transferTime
        orderPreviewData.storageDays = billingSnapshot.days
        orderPreviewData.dailyRate = dailyRate
        orderPreviewData.totalFee = billingSnapshot.total
        orderPreviewData.paidFee = billingSnapshot.paid
        orderPreviewData.feeStatus = billingSnapshot.remaining <= 0 ? 'paid' : billingSnapshot.paid > 0 ? 'partial' : 'unpaid'
        orderPreviewData.transferType = transferForm.transferType
        orderPreviewData.receiver = transferForm.receiver || undefined
        orderPreviewData.receiverIdCard = transferForm.receiverIdCard || undefined
        orderPreviewData.policeCertNo = selectedBody.value!.policeCertNo
        orderPreviewData.processDestination = selectedBody.value!.processDestination
        orderPreviewData.operator = transferForm.operator
        orderPreviewData.remarks = transferForm.remarks || undefined
        
        transferOrderVisible.value = true
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
  identityForm.policeCertNo = body.policeCertNo || ''
  identityForm.familyName = body.familyName || ''
  identityForm.familyPhone = body.familyPhone || ''
  identityForm.familyRelation = body.familyRelation || ''
  identityForm.processDestination = body.processDestination || ''
  identityForm.operator = ''
  identityForm.remarks = ''
  identityDialogVisible.value = true
}

async function submitIdentity() {
  if (!identityFormRef.value || !identityBody.value) return
  
  await identityFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    const body = identityBody.value
    const operator = identityForm.operator
    
    const fieldMap: Array<[string, string | undefined, string | undefined]> = [
      ['姓名', body.name, identityForm.name],
      ['性别', body.gender, identityForm.gender],
      ['年龄', body.age?.toString(), identityForm.age?.toString()],
      ['身份证号', body.idCard, identityForm.idCard],
      ['公安证明编号', body.policeCertNo, identityForm.policeCertNo],
      ['家属姓名', body.familyName, identityForm.familyName],
      ['联系电话', body.familyPhone, identityForm.familyPhone],
      ['与死者关系', body.familyRelation, identityForm.familyRelation],
      ['处理去向', body.processDestination, identityForm.processDestination]
    ]
    
    fieldMap.forEach(([field, oldVal, newVal]) => {
      if ((oldVal || '') !== (newVal || '')) {
        store.addIdentityHistory(
          body.id,
          operator,
          field,
          oldVal || '(空)',
          newVal || '(空)',
          identityForm.remarks || undefined
        )
      }
    })
    
    store.updateBody(body.id, {
      name: identityForm.name,
      gender: identityForm.gender,
      age: identityForm.age,
      idCard: identityForm.idCard,
      policeCertNo: identityForm.policeCertNo || undefined,
      isUnknown: false,
      familyName: identityForm.familyName,
      familyPhone: identityForm.familyPhone,
      familyRelation: identityForm.familyRelation,
      processDestination: identityForm.processDestination || undefined,
      remarks: identityForm.remarks || body.remarks,
      verifyStatus: 'verified'
    })
    
    ElMessage.success('身份信息更新成功，所有变更已留痕记录')
    identityDialogVisible.value = false
  })
}

function processUnknown(body: BodyInfo) {
  unknownProcessBody.value = body
  unknownProcessForm.policeCertNo = body.policeCertNo || ''
  unknownProcessForm.processDestination = '火化处理'
  unknownProcessForm.operator = ''
  unknownProcessForm.remarks = ''
  unknownProcessVisible.value = true
}

async function submitUnknownProcess() {
  if (!unknownProcessFormRef.value || !unknownProcessBody.value) return
  
  await unknownProcessFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    const body = unknownProcessBody.value
    const billing = store.billingRecords.find(b => b.bodyId === body.id && !b.exitTime)
    
    ElMessageBox.confirm(
      `确认对无名遗体 ${body.name} 进行${unknownProcessForm.processDestination}处理吗？\n公安证明编号：${unknownProcessForm.policeCertNo}\n此操作将永久生效，请确认信息无误。`,
      '无名遗体处理确认',
      {
        confirmButtonText: '确认处理',
        cancelButtonText: '取消',
        type: 'danger'
      }
    ).then(() => {
      if (billing) {
        const billingInfo = store.calculateBilling(body.id)
        if (billingInfo.remaining > 0) {
          store.updateBillingPayment(billing.id, billingInfo.remaining)
        }
      }
      
      store.updateBody(body.id, {
        policeCertNo: unknownProcessForm.policeCertNo,
        processDestination: unknownProcessForm.processDestination
      })
      
      const transfer = store.transferBody(
        body.id,
        'cremation',
        unknownProcessForm.operator,
        undefined,
        undefined,
        unknownProcessForm.remarks || undefined,
        {
          isUnknown: true,
          policeCertNo: unknownProcessForm.policeCertNo,
          processDestination: unknownProcessForm.processDestination
        }
      )
      
      if (transfer) {
        ElMessage.success('无名遗体已按流程处理，处理记录已归档')
        unknownProcessVisible.value = false
        activeTab.value = 'records'
      }
    }).catch(() => {})
  })
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

.quick-pay {
  margin-top: 12px;
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
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
.identity-content,
.unknown-process-content {
  padding: 10px 0;
}

.history-item {
  font-size: 14px;
  .new-value {
    color: #409eff;
    font-weight: 600;
  }
  .history-remarks {
    color: #909399;
    font-size: 12px;
  }
}

.transfer-order {
  padding: 20px;
  background: white;
}

.order-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 24px;
  }
  
  .order-no {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }
}

.order-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.remarks-text {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.order-signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 20px 0;
  gap: 20px;
}

.sig-item {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.sig-line {
  display: inline-block;
  flex: 1;
  border-bottom: 1px solid #333;
  margin-left: 10px;
}
</style>
