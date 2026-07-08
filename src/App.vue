<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useItemsStore } from './stores/items'
import { useSettingsStore } from './stores/settings'


const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()

onMounted(() => {
  settingsStore.initialise()
  itemsStore.initialise()
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
