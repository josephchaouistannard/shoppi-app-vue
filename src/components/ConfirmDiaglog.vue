<script setup lang="ts">
import { useConfirm } from "@/composables/confirm";

const { visible, options, close } = useConfirm();
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay">
      <div class="dialog">
        <h3>{{ options.title }}</h3>

        <p>{{ options.message }}</p>

        <div class="actions">
          <button class="cancel" @click="close(false)">
            {{ options.cancelText }}
          </button>

          <button class="confirm" @click="close(true)">
            {{ options.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.dialog {
  width: min(90vw, 300px);
  padding: 1rem;
  background: var(--color-bg);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin: 0 0 0.75rem;
}

.dialog p {
  margin: 0 0 1.5rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.actions button {
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.confirm {
  color: var(--color-primary);
}

.cancel {
  color: var(--color-muted);
}
</style>
