<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDiaglog from '@/components/ConfirmDiaglog.vue'
import { App } from '@capacitor/app';


const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()

onMounted(() => {
  settingsStore.initialise()
  itemsStore.initialise()
  App.addListener('appStateChange', ({ isActive }) => {
    if (!settingsStore.missingApiSettings) {
      itemsStore.syncWithServer()
    };
  });
  App.addListener('backButton', () => {
    if (route.path == '/settings') {
      router.back()
    } else {
      App.exitApp()
    }
  })
})
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ConfirmDiaglog />
</template>

<style scoped></style>
