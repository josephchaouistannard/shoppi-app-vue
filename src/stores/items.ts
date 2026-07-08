import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TItem } from '../types/TItem'
import { useSettingsStore } from './settings'

export const useItemsStore = defineStore('items', () => {
  const settingsStore = useSettingsStore()
  const items = ref<TItem[]>([])
  const count = computed(() => items.value.length)
  const categoriesNotDeleted = computed(() =>
    [...new Set(
      items.value
        .filter(item => !item.isDeleted)
        .map(item => item.category)
    )]
  )
  const itemsByCategoryNotDeleted = computed(() => {
    return (cat: string | null) =>
      items.value.filter(item => item.category === cat && !item.isDeleted)
  })
  const isInitialised = ref(false)
  const ITEMS_KEY = "items"
  const LAST_SYNCED_KEY = "lastSyncedAt"
  const isSyncing = ref(false)
  const justSynced = ref(false)
  const syncError = ref(false)
  const lastSyncedAt = ref<string | null>(localStorage.getItem(LAST_SYNCED_KEY))

  async function initialise() {
    if (isInitialised.value) return

    try {
      const storedItems = localStorage.getItem(ITEMS_KEY)

      if (storedItems) {
        items.value = JSON.parse(storedItems)
      }
    } catch (error) {
      console.error('Failed to parse items from storage', error)
    } finally {
      isInitialised.value = true
    }
  }

  function setItems(newItems: TItem[]) {
    items.value = newItems
    persistItems()
    triggerDebouncedSync()
  }

  function addItem(name: string) {
    const item: TItem = {
      id: crypto.randomUUID(),
      name: name,
      category: null,
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      isDeleted: false
    }
    items.value.push(item)
    persistItems()
    triggerDebouncedSync()
  }

  function removeItem(id: string) {
    const item = items.value.find(item => item.id === id)
    if (item) {
      item.isDeleted = true
      item.updatedAt = new Date().toISOString()
    }
    persistItems()
    triggerDebouncedSync()
  }

  function updateCategory(id: string, cat: string | null) {
    const item = items.value.find(item => item.id === id)

    if (!item) return

    item.category = cat
    item.updatedAt = new Date().toISOString()

    persistItems()
    triggerDebouncedSync()
  }

  function persistItems() {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items.value))
    if (lastSyncedAt.value) {
      localStorage.setItem(LAST_SYNCED_KEY, lastSyncedAt.value)
    }
  }

  async function syncWithServer() {
    if (isSyncing.value) return

    if (!settingsStore.apiUrl || !settingsStore.apiToken) {
      console.warn('Sync aborted: API credentials are not set.')
      throw new Error('Missing sync api credentials')
    }

    isSyncing.value = true
    syncError.value = false
    justSynced.value = false

    try {
      const response = await fetch(`${settingsStore.apiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settingsStore.apiToken}`
        },
        body: JSON.stringify({ items: items.value }) // Send full list
      })

      if (!response.ok) {
        syncError.value = true
        throw new Error('Sync failed')
      }
      const data = await response.json()

      if (data.items) {
        // Overwrite local state with the server's merged response
        items.value = data.items
        lastSyncedAt.value = new Date().toISOString()
        persistItems()
        justSynced.value = true
        setTimeout(() => {
          justSynced.value = false
        }, 2000);
      }
    } catch (error) {
      syncError.value = true
      setTimeout(() => {
        syncError.value = false
      }, 4000)
      console.warn('Sync failed (offline or server down). Storing changes locally.', error)
    } finally {
      isSyncing.value = false
    }
  }

  // Optional: A helper to debounce sync when the user is typing/editing
  let syncTimeout: ReturnType<typeof setTimeout>
  function triggerDebouncedSync() {
    clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      syncWithServer()
    }, 5000)
  }



  return {
    items,
    count,
    setItems,
    addItem,
    removeItem,
    initialise,
    updateCategory,
    categories: categoriesNotDeleted,
    itemsByCategory: itemsByCategoryNotDeleted,
    lastSyncedAt,
    isSyncing,
    justSynced,
    syncWithServer,
    triggerDebouncedSync,
    syncError
  }
})
