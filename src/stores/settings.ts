import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TProvider } from '@/types/TProvider'

export const useSettingsStore = defineStore('settings', () => {
  // SYNC SERVER
  const apiUrl = ref('')
  const API_URL_KEY = 'apiUrl'
  const apiToken = ref('')
  const API_TOKEN_KEY = 'apiToken'

  const missingApiSettings = computed(() => {
    return (!apiToken.value || !apiUrl.value) && isInitialised.value
  })

  function setApiUrl(url: string) {
    const normalizedUrl = url.trim().match(/^https?:\/\//) ? url.trim() : `https://${url.trim()}`

    apiUrl.value = normalizedUrl
    localStorage.setItem(API_URL_KEY, normalizedUrl)
  }

  function setApiToken(token: string) {
    apiToken.value = token
    localStorage.setItem(API_TOKEN_KEY, token)
  }

  function resetSyncServer() {
    apiUrl.value = ''
    localStorage.setItem(API_URL_KEY, '')
    apiToken.value = ''
    localStorage.setItem(API_TOKEN_KEY, '')
  }

  // LANGUAGE
  const langCategories = ref('')
  const LANG_CAT_KEY = 'langCategories'

  function setLangCategories(lang: string) {
    langCategories.value = lang
    localStorage.setItem(LANG_CAT_KEY, lang)
  }

  // AI CATEGORISATION
  const providers = ref<TProvider[]>([])
  const activeProvider = computed(() => {
    return providers.value.find((p) => p.active === true)
  })
  const PROVIDERS_KEY = 'providers'
  const DEFAULT_PROVIDERS: TProvider[] = [
    {
      name: 'Groq',
      apiKey: null,
      active: false,
    },
    {
      name: 'Gemini',
      apiKey: null,
      active: false,
    },
  ]

  function updateProviderApiKey(name: string, key: string) {
    const provider = providers.value.find((p) => p.name == name)
    if (!provider) {
      return
    }
    provider.apiKey = key
    persistProviders()
  }

  function deleteProviderApiKey(name: string) {
    const provider = providers.value.find((p) => p.name == name)
    if (!provider) {
      return
    }
    provider.apiKey = null
    persistProviders()
  }

  function setActiveProvider(name: string) {
    for (const provider of providers.value) {
      if (provider.name === name) {
        provider.active = true
      } else {
        provider.active = false
      }
    }
    persistProviders()
  }

  function persistProviders() {
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers.value))
  }

  // INITIALISATION
  const isInitialised = ref(false)
  async function initialise() {
    if (isInitialised.value) return

    try {
      // Load sync server settings if found
      const storedApiUrl = localStorage.getItem(API_URL_KEY)
      const storedApiToken = localStorage.getItem(API_TOKEN_KEY)
      if (storedApiUrl) {
        apiUrl.value = storedApiUrl
      }
      if (storedApiToken) {
        apiToken.value = storedApiToken
      }

      // Load language settings or revert to English
      const storedLangCategories = localStorage.getItem(LANG_CAT_KEY)
      if (storedLangCategories) {
        langCategories.value = storedLangCategories
      } else {
        langCategories.value = 'English'
      }

      // Load AI providers, with API Key if found, without if not
      const storedProviders = localStorage.getItem(PROVIDERS_KEY)
      if (storedProviders) {
        providers.value = JSON.parse(storedProviders)
      } else {
        providers.value = DEFAULT_PROVIDERS
      }
    } catch (error) {
      console.error('Failed to initialise settings', error)
    } finally {
      isInitialised.value = true
    }
  }

  return {
    apiUrl,
    apiToken,
    missingApiSettings,
    initialise,
    setApiUrl,
    setApiToken,
    setLangCategories,
    langCategories,
    providers,
    activeProvider,
    setActiveProvider,
    updateProviderApiKey,
    deleteProviderApiKey,
    resetSyncServer,
  }
})
