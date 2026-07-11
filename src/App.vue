<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDiaglog from '@/components/ConfirmDiaglog.vue'
import { App } from '@capacitor/app';



const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()

onMounted(() => {
  settingsStore.initialise()
  itemsStore.initialise()
  App.addListener('appStateChange', ({ isActive }) => {
    if (!settingsStore.missingApiSettings) {
      itemsStore.triggerDebouncedSync()
    };
  });
})
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ConfirmDiaglog />
</template>

<style scoped></style>
