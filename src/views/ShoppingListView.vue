<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useItemsStore } from '../stores/items'
import type { TItem } from '../types/TItem';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../stores/settings'
import { categoriseWithAI } from '@/utils/categoriseWithAI';

const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()

const newItemName = ref('')
const categorisationInProgress = ref(false)

const router = useRouter()

onMounted(() => {
  itemsStore.triggerDebouncedSync()

  window.addEventListener('focus', () => {
    itemsStore.triggerDebouncedSync()
  })
})

function handleAddItem() {
  if (newItemName.value.trim() === '') {
    return
  }
  itemsStore.addItem(newItemName.value)
  newItemName.value = ""
}
async function handleCategorisation() {
  const activeProvider = settingsStore.activeProvider

  if (!activeProvider) {
    console.warn("No AI provider chosen")
    return
  }

  if (!activeProvider.apiKey) {
    console.warn("No API key for active AI provider")
    return
  }

  categorisationInProgress.value = true
  const response = await categoriseWithAI(activeProvider.name, itemsStore.items, activeProvider.apiKey, settingsStore.langCategories)
  categorisationInProgress.value = false;
  if (response['items']) {
    response['items'].forEach((item: TItem) => {
      console.log(`Updating category for ${item.id}: ${item.category}`)
      itemsStore.updateCategory(item.id, item.category)
    })
  }
}

function handleRemove(id: string) {
  itemsStore.removeItem(id)
}

</script>

<template>
  <div class="viewContainer">
    <header>
      <h2>Shopping List</h2>
      <div class="syncIndicator">
        <img class="syncInProgress" src="../assets/syncInProgress.svg" v-if="itemsStore.isSyncing" />
        <img class="syncSuccess" src="../assets/syncSuccess.svg" v-else-if="itemsStore.justSynced" />
        <img class="syncError" src="../assets/syncError.svg" v-else-if="itemsStore.syncError" />
      </div>
      <button v-if="!categorisationInProgress" class="magicBtn" @click="handleCategorisation">Magic</button>
      <div v-else class="workingMagic">
        <div class="spinner"></div>
      </div>
      <img src="../assets/settings.svg" @click="router.push('/settings')" />
    </header>
    <div class="formContainer">
      <div class="fc">
        <p>Add a new item:</p>
        <input type="text" v-model="newItemName" @keyup.enter="handleAddItem" />
      </div>
      <div class="fr endButtonContainer">
        <button @click="handleAddItem">Add</button>
      </div>
    </div>
    <div class="shoppingList">
      <div v-for="cat in itemsStore.categories" class="categoryGroup">
        <div class="categoryHeader">
          <strong>
            {{ cat ?? "Sans Categorie" }}
          </strong>
        </div>
        <div v-for="item in itemsStore.itemsByCategory(cat)" :key="item.id">
          <div class="listItem fr">
            <div class="itemInfo">
              <p>{{ item.name }}</p>
              <!-- <p class="softDeleteIndicator" v-if="item.isDeleted">X</p>
                          <small>{{ item.id }}</small>
            <p v-if="item.category">{{ item.category }}</p>
            <small>Synced at: {{ item.syncedAt }}</small>
            <small>Updated at: {{ item.updatedAt }}</small> -->
            </div>
            <div class="fr endButtonContainer">
              <button class="removeBtn" @click="handleRemove(item.id)">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.syncInProgress {
  color: grey;
}

.syncSuccess {
  color: green;
}

.syncError {
  color: darkred;
}

.fr {
  display: flex;
  flex-direction: row;
}

.fc {
  display: flex;
  flex-direction: column;
}

.viewContainer {
  max-width: 420px;
  margin: 1rem auto;
  padding: 0 0.75rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--color-text, #1a1a1a);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

/* Buttons */
button {
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: var(--radius-sm, 6px);
  padding: 0.35em 0.7em;
  background: var(--color-bg, #fff);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

button:hover {
  border-color: var(--color-primary, #888);
}

button:active {
  background-color: var(--color-muted, #f0f0f0);
}

.magicBtn,
.workingMagic {
  width: 80px;
  height: 32px;
}

.workingMagic {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #d8c7ff;
  border-top-color: #7c4dff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.magicBtn {
  background: linear-gradient(135deg, #f5f0ff, #ede4ff);
  border-color: #d8c7ff;
  font-weight: 500;
}

.removeBtn {
  color: #b3261e;
  border-color: #f2c9c6;
  background: #fdf3f2;
  font-size: 0.8rem;
  padding: 0.3em 0.6em;
}

.removeBtn:hover {
  background: #fbe4e2;
  border-color: #e39a95;
}

/* Form */
.formContainer {
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-sm, 8px);
  padding: 0.6em;
  background: var(--color-surface, #fafafa);
  margin-bottom: 0.75rem;
}

.formContainer .fc p {
  margin: 0 0 0.25em;
  font-size: 0.78rem;
  color: var(--color-text-muted, #666);
}

input {
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: var(--radius-sm, 6px);
  padding: 0.4em 0.6em;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--color-primary, #888);
}

.endButtonContainer {
  padding-top: 0.35em;
  justify-content: end;
}

/* Shopping list */
.categoryGroup {
  margin-bottom: 0.2rem;
}

.categoryHeader {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted, #888);
  padding-bottom: 0.2em;
  border-bottom: 1px solid var(--color-border, #eee);
  margin-bottom: 0.1em;
}

.listItem {
  align-items: center;
  justify-content: space-between;
  padding: 0.1em 0.1em;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.listItem:last-child {
  border-bottom: none;
}

.itemInfo {
  width: 100%;
}

.itemInfo p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
