<script setup lang="ts">
import { useToast } from '../composables/toast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      @click="removeToast(toast.id)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
/* Positions the toasts at the top-center of the screen */
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none; /* Allows clicking elements behind the empty space */
}

/* Minimal styling so they are visible and interactive */
.toast {
  pointer-events: auto; /* Re-enables clicking on the toast itself to dismiss */
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.success {
  background-color: #5cb87a; /* Green */
}

.error {
  background-color: #d9534f; /* Red */
}
</style>
