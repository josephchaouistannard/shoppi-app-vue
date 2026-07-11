<script setup lang="ts">
import { useToast } from '@/composables/toast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type" @click="removeToast(toast.id)">
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
/* Positions the toasts at the top-center of the screen */
.toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  color: #fff;
  padding: var(--space-xs) var(--space-md);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0.95;
  text-align: center;
}

.success {
  background-color: var(--color-good);
}

.error {
  background-color: var(--color-bad);
}

.warn {
  background-color: var(--color-warn);
}

.info {
  background-color: var(--color-muted);
}
</style>
