import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/variables.css'
import './assets/reset.css'
import { useSettingsStore } from './stores/settings.ts'
import { useItemsStore } from './stores/items.ts'

const app = createApp(App)

app.use(createPinia())
app.use(router)


const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()


settingsStore.initialise().then(() => {
  itemsStore.initialise().then(() => {
    app.mount('#app')
  })
})

