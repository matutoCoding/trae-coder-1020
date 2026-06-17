<template>
  <el-container class="main-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#409EFF"><ColdDrink /></el-icon>
        <span class="logo-text">殡仪馆冷藏柜位管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        background-color="#1f2d3d"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon>
            <component :is="route.meta.icon" />
          </el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-badge :value="overdueCount" :hidden="overdueCount === 0" type="warning">
            <el-button type="text" @click="goToBilling">
              <el-icon :size="20"><Bell /></el-icon>
              <span style="margin-left: 4px">超期提醒</span>
            </el-button>
          </el-badge>
          <el-badge :value="alarmCount" :hidden="alarmCount === 0" type="danger">
            <el-button type="text" @click="goToTemperature">
              <el-icon :size="20"><Warning /></el-icon>
              <span style="margin-left: 4px">温度报警</span>
            </el-button>
          </el-badge>
          <el-divider direction="vertical" />
          <span class="current-time">{{ currentTime }}</span>
          <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="username">管理员</span>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <el-footer class="footer">
        <span>殡仪馆冷藏柜位管理系统 v1.0.0 © 2024</span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCabinetStore } from '@/stores/cabinet'
import { ColdDrink, Bell, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const cabinetStore = useCabinetStore()

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta.title as string || '首页')

const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  return routes.filter(r => r.meta && r.meta.title && r.path !== '/')
})

const currentTime = ref('')
let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const overdueCount = computed(() => cabinetStore.overdueReminders.length)
const alarmCount = computed(() => cabinetStore.temperatureAlarms.filter(a => !a.handled).length)

const goToBilling = () => {
  router.push('/billing')
}

const goToTemperature = () => {
  router.push('/temperature-monitor')
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.main-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #1f2d3d;
  display: flex;
  flex-direction: column;

  .logo {
    display: flex;
    align-items: center;
    padding: 20px 16px;
    border-bottom: 1px solid #3d4d65;

    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      margin-left: 10px;
      line-height: 1.2;
    }
  }

  .menu {
    flex: 1;
    border-right: none;

    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;

      &:hover {
        background-color: #2d3d54 !important;
      }

      &.is-active {
        background-color: #2d3d54 !important;
      }
    }
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;

  .header-left h2 {
    margin: 0;
    font-size: 20px;
    color: #303133;
    font-weight: 600;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .current-time {
      color: #606266;
      font-size: 14px;
    }

    .username {
      color: #303133;
      font-size: 14px;
    }
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 12px;
  height: 40px !important;
  padding: 0 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
