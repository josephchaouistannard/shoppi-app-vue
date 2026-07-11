<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useItemsStore } from '@/stores/items'
import type { TItem } from '@/types/TItem';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings'
import { categoriseWithAI } from '@/utils/categoriseWithAI';
import { useToast } from '@/composables/toast'

const toasts = useToast()
const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()
const router = useRouter()

const newItemName = ref('')
const categorisationInProgress = ref(false)


onMounted(() => {
  if (!settingsStore.missingApiSettings) {
    itemsStore.triggerDebouncedSync()
  }

  // Works on web but not on android
  window.addEventListener('focus', () => {
    if (!settingsStore.missingApiSettings) {
      itemsStore.triggerDebouncedSync()
    }
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
    toasts.addToast('No AI provider chosen', 'warn')
    return
  }

  if (!activeProvider.apiKey) {
    toasts.addToast('No API key for chosen provider', 'warn')
    return
  }

  if (itemsStore.items.length === 0) {
    toasts.addToast('No items to categorise', 'warn')
    return
  }

  categorisationInProgress.value = true
  try {
    const response = await categoriseWithAI(activeProvider.name, itemsStore.items, activeProvider.apiKey, settingsStore.langCategories)
    categorisationInProgress.value = false;

    if (response['items']) {
      response['items'].forEach((item: TItem) => {
        console.log(`Updating category for ${item.id}: ${item.category}`)
        itemsStore.updateCategory(item.id, item.category)
      })
    } else {
      toasts.addToast('No list returned', 'error')
    }
  } catch (err) {
    toasts.addToast('Something went wrong', 'error')
    console.error('Categorisation error', err)
  }

}

function handleRemove(id: string) {
  itemsStore.removeItem(id)
}

</script>

<template>
  <div class="viewContainer">
    <header>
      <h2>Shoppi</h2>
      <div class="syncIndicator">
        <img class="syncInProgress" src="../assets/syncInProgress.svg" v-if="itemsStore.isSyncing" />
        <img class="syncSuccess" src="../assets/syncSuccess.svg" v-else-if="itemsStore.justSynced" />
        <img class="syncError" src="../assets/syncError.svg" v-else-if="itemsStore.syncError" />
      </div>
      <img v-if="!categorisationInProgress" src="../assets/categories.svg" class="catBtn"
        @click="handleCategorisation" />
      <div v-else class="catSpinnerContainer">
        <div class="spinner"></div>
      </div>
      <img class="settingsBtn" src="../assets/settings.svg" @click="router.push('/settings')" />
    </header>

    <section class="newItemSection">
      <small>Add a new item:</small>
      <div>
        <input type="text" v-model="newItemName" @keyup.enter="handleAddItem" />
        <img src="../assets/add.svg" class="addBtn" @click="handleAddItem" />
      </div>
    </section>
    <section class="shoppingList">
      <div v-for="cat in itemsStore.categories" class="categoryGroup">
        <div class="categoryHeader">
          <strong>
            {{ cat ?? "Sans Categorie" }}
          </strong>
        </div>
        <div v-for="item in itemsStore.itemsByCategory(cat)" :key="item.id">
          <div class="listItem">
            <p>{{ item.name }}</p>
            <img src="../assets/delete.svg" class="removeBtn" @click="handleRemove(item.id)" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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

.newItemSection {
  width: 95%;
  margin: var(--space-lg) auto;
}

.newItemSection div {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-md);
}

.addBtn,
.removeBtn,
.catBtn,
.settingsBtn {
  width: var(--icon-size);
  height: var(--icon-size);
  transition: 0.2s all ease-in-out;
}

.addBtn:active,
.removeBtn:active,
.catBtn:active,
.settingsBtn:active {
  transform: scale(1.2);
}

header {
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem;
  margin: auto;
}

header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.catBtn,
.catSpinnerContainer {
  width: var(--icon-size);
  height: var(--icon-size);
}

.catSpinnerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: var(--icon-size);
  height: var(--icon-size);
  border: 3px solid var(--color-muted);
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.categoryGroup {
  margin-bottom: 0.2rem;
}

.categoryHeader {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  color: var(--color-text-muted, #888);
  padding-bottom: var(--space-xs);
  margin: auto;
  border-bottom: 1px solid var(--color-border, #eee);
}

.listItem {
  width: 90%;
  margin: auto;
  font-size: var(--font-size-sm);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs);
  text-transform: capitalize;
}
</style>
