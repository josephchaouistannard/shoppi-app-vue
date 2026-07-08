<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useItemsStore } from '../stores/items'
import { useSettingsStore } from '../stores/settings'
import { categoriseWithGemini } from '@/utils/gemini';
import type { TItem } from '../types/TItem';
import { useRouter } from 'vue-router';

const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()
const router = useRouter()

const newUrl = ref('')
const newToken = ref('')
const newGeminiKey = ref('')

onMounted(() => {
  settingsStore.initialise()
  itemsStore.initialise()
})

function handleSaveUrl() {
  settingsStore.setApiUrl(newUrl.value)
}
function handleSaveToken() {
  settingsStore.setApiToken(newToken.value)
}
function handleSaveGeminiKey() {
  settingsStore.setGeminiApiKey(newGeminiKey.value)
}

</script>

<template>
  <div class="viewContainer">
    <header>
      <img src="../assets/backarrow.svg" @click="router.back()"/>
    </header>
    <div class="formContainer">
      <div class="fc">
        <p>API URL:</p>
        <small v-if="settingsStore.apiUrl">{{settingsStore.apiUrl}}</small>
        <input type="text" v-model="newUrl" @keyup.enter="handleSaveUrl" />
      </div>
      <div class="fr endButtonContainer">
        <button @click="handleSaveUrl">Save</button>
      </div>
      <div class="fc">
        <p>API Token:</p>
        <small v-if="settingsStore.apiToken">{{settingsStore.apiToken}}</small>
        <input type="text" v-model="newToken" @keyup.enter="handleSaveToken" />
      </div>
      <div class="fr endButtonContainer">
        <button @click="handleSaveToken">Save</button>
      </div>
    </div>
    <div class="formContainer">
      <div class="fc">
        <p>Magic Gemini Key:</p>
        <small v-if="settingsStore.geminiApiKey">Key set</small>
        <input type="text" v-model="newGeminiKey" @keyup.enter="handleSaveGeminiKey" />
      </div>
      <div class="fr endButtonContainer">
        <button @click="handleSaveGeminiKey">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.syncInProgress {
  color: grey;
}

.syncSuccess{
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
