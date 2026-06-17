import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/cabinet-status'
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: 'cabinet-status',
        name: 'CabinetStatus',
        component: () => import('@/views/CabinetStatus.vue'),
        meta: { title: '柜位状态', icon: 'ColdDrink' }
      },
      {
        path: 'body-registration',
        name: 'BodyRegistration',
        component: () => import('@/views/BodyRegistration.vue'),
        meta: { title: '入柜登记', icon: 'DocumentAdd' }
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/Billing.vue'),
        meta: { title: '寄存计费', icon: 'Money' }
      },
      {
        path: 'transfer-out',
        name: 'TransferOut',
        component: () => import('@/views/TransferOut.vue'),
        meta: { title: '交接出柜', icon: 'TakeawayBox' }
      },
      {
        path: 'temperature-monitor',
        name: 'TemperatureMonitor',
        component: () => import('@/views/TemperatureMonitor.vue'),
        meta: { title: '温度监控', icon: 'Odometer' }
      },
      {
        path: 'equipment-maintenance',
        name: 'EquipmentMaintenance',
        component: () => import('@/views/EquipmentMaintenance.vue'),
        meta: { title: '设备维保', icon: 'Tools' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '统计报表', icon: 'DataLine' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
