<template>
  <router-view />
</template>

<script setup lang="ts">
import { useCabinetStore } from '@/stores/cabinet'
import { onMounted, onUnmounted } from 'vue'

const cabinetStore = useCabinetStore()
let temperatureTimer: number | null = null

onMounted(() => {
  temperatureTimer = window.setInterval(() => {
    cabinetStore.updateTemperatures()
  }, 10000)
})

onUnmounted(() => {
  if (temperatureTimer) {
    clearInterval(temperatureTimer)
  }
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
