import { createRouter, createWebHistory } from 'vue-router'
import ShoppingListView from '../views/ShoppingListView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'Home', path: '/', component: ShoppingListView },
    { name: 'Settings', path: '/settings', component: SettingsView },
  ],
})

export default router
