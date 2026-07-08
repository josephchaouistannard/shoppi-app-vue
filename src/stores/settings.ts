import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const apiUrl = ref('')
  const API_URL_KEY = "apiUrl"
  const apiToken = ref('')
  const API_TOKEN_KEY = "apiToken"
  const geminiApiKey = ref('')
  const GEMINI_STORAGE_KEY = "geminiApiKey"
  const isInitialised = ref(false)
  const missingApiSettings = computed(() => {
    return (!apiToken.value || !apiUrl.value) && isInitialised.value
  })

  async function initialise() {
    if (isInitialised.value) return

    try {
      const storedApiUrl = localStorage.getItem(API_URL_KEY)
      const storedApiToken = localStorage.getItem(API_TOKEN_KEY)
      if (storedApiUrl) {
        apiUrl.value = storedApiUrl
      }
      if (storedApiToken) {
        apiToken.value = storedApiToken
      }

      const storedGeminiKey = localStorage.getItem(GEMINI_STORAGE_KEY)
      if (storedGeminiKey) {
        geminiApiKey.value = storedGeminiKey
      }

    } catch (error) {
      console.error('Failed to parse api settings from storage', error)
    } finally {
      isInitialised.value = true
    }
  }

  function setApiUrl(url: string) {
    const normalizedUrl = url.trim().match(/^https?:\/\//)
      ? url.trim()
      : `https://${url.trim()}`;

    apiUrl.value = normalizedUrl;
    localStorage.setItem(API_URL_KEY, normalizedUrl);
  }

  function setApiToken(token: string) {
    apiToken.value = token;
    localStorage.setItem(API_TOKEN_KEY, token)
  }

  function setGeminiApiKey(key: string) {
    geminiApiKey.value = key
    localStorage.setItem(GEMINI_STORAGE_KEY, key)
  }

  return {
    apiUrl,
    apiToken,
    missingApiSettings,
    initialise,
    setApiUrl,
    setApiToken,
    setGeminiApiKey,
    geminiApiKey,
  }
})
