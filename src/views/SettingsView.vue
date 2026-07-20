<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/toast'
import { useConfirm } from '@/composables/confirm'
import QRCode from 'qrcode'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner';

const { confirm } = useConfirm()
const toasts = useToast()
const settingsStore = useSettingsStore()
const itemsStore = useItemsStore()
const router = useRouter()

const newUrl = ref('')
const newToken = ref('')
const newLangCat = ref('')
const newProviderApiKey = ref('')
const qrCodeUrl = ref('');

onMounted(() => {
  settingsStore.initialise()
  itemsStore.initialise()
})

function handleSaveUrl() {
  if (newUrl.value.trim() !== '') {
    settingsStore.setApiUrl(newUrl.value)
    toasts.addToast('URL saved', 'success')
  }
}
function handleSaveToken() {
  if (newToken.value.trim() !== '') {
    settingsStore.setApiToken(newToken.value)
    toasts.addToast('Api key saved', 'success')
  }
}
function handleSaveLangCat() {
  if (newLangCat.value.trim() !== '') {
    settingsStore.setLangCategories(newLangCat.value)
    toasts.addToast('Category language saved', 'success')
  }
}
function handleSaveProviderApiKey() {
  const name = settingsStore.activeProvider?.name
  if (name && newProviderApiKey.value.trim() !== '') {
    settingsStore.updateProviderApiKey(name, newProviderApiKey.value)
    newProviderApiKey.value = ''
    toasts.addToast('API key saved', 'success')
  }
}

function handleSetActiveProvider(name: string) {
  settingsStore.setActiveProvider(name)
}

async function handleSyncServerReset() {
  const ok = await confirm({
    title: `Reset Sync Server`,
    message: `The saved sync server URL and key will be deleted permanently.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (ok) {
    settingsStore.resetSyncServer()
    toasts.addToast('API key deleted', 'info')
  }
}

async function handleProviderKeyReset(name: string) {
  const ok = await confirm({
    title: `Delete ${name} API key`,
    message: `Your ${name} API key will be permanently deleted`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (ok) {
    settingsStore.deleteProviderApiKey(name)
    toasts.addToast('API key deleted', 'info')
  }
}

async function generateQR() {
  const settingsData = settingsStore.$state;
  const jsonString = JSON.stringify(settingsData);
  const base64Data = btoa(encodeURIComponent(jsonString));

  try {
    qrCodeUrl.value = await QRCode.toDataURL(base64Data, {
      errorCorrectionLevel: 'M',
      margin: 2
    });
  } catch (err) {
    toasts.addToast('Failed to generate QR code', 'error')
    console.error('Failed to generate QR Code', err);
  }
}

async function scanQR() {
  try {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.QR_CODE
    });

    if (result && result.ScanResult) {
      const decodedJsonString = decodeURIComponent(atob(result.ScanResult));
      const importedSettings = JSON.parse(decodedJsonString);

      settingsStore.$state = importedSettings
      settingsStore.persistApiSettings()
      settingsStore.persistLangSettings()
      settingsStore.persistProviders()

      toasts.addToast('Setting imported', 'success')
    }
  } catch (error) {
    console.error('Scan failed', error);
    toasts.addToast('Failed to scan QR code', 'error')
  }
};

function closeModal() {
  qrCodeUrl.value = ''
}

</script>

<template>
  <div class="viewContainer">
    <header>
      <img class="backBtn" src="../assets/backarrow.svg" @click="router.back()" />
      <img class="shareBtn" src="../assets/share.svg" @click="generateQR" />
      <img class="shareBtn" src="../assets/qr.svg" @click="scanQR" />
    </header>
    <section>
      <h4>Sync Server</h4>
      <small>API URL:</small>
      <small v-if="settingsStore.apiUrl">{{ settingsStore.apiUrl }}</small>
      <div class="textInputContainer">
        <input type="text" v-model="newUrl" @keyup.enter="handleSaveUrl" />
        <img class="saveBtn" src="../assets/save.svg" @click="handleSaveUrl" />
      </div>
      <small>API Key:</small>
      <small v-if="settingsStore.apiToken">{{ settingsStore.apiToken }}</small>
      <div class="textInputContainer">
        <input type="text" v-model="newToken" @keyup.enter="handleSaveToken" />
        <img class="saveBtn" src="../assets/save.svg" @click="handleSaveToken" />
      </div>
      <div class="fr endButtonContainer">
        <button @click="handleSyncServerReset">Reset</button>
      </div>
    </section>
    <section>
      <h4>Language</h4>
      <small>Language to use for categories: </small>
      <small v-if="settingsStore.langCategories">{{ settingsStore.langCategories }}</small>
      <div class="textInputContainer">
        <input type="text" v-model="newLangCat" @keyup.enter="handleSaveLangCat" />
        <img class="saveBtn" src="../assets/save.svg" @click="handleSaveLangCat" />
      </div>
    </section>

    <section>
      <div class="fc">
        <h4>AI Categorisation</h4>
        <small>Choose active provider:</small>
        <div class="providerRadio" v-for="provider in settingsStore.providers" :key="provider.name">
          <label :for="provider.name" :key="provider.name">
            {{ provider.name }}
          </label>
          <img class="savedKey" @click="handleProviderKeyReset(provider.name)" v-if="provider.apiKey"
            src="../assets/key.svg" />
          <img class="noKeySaved" v-else src="../assets/keyOff.svg" />
          <input type="radio" :id="provider.name" name="providerName" :value="provider.name"
            :checked="provider.name === settingsStore.activeProvider?.name"
            @change="handleSetActiveProvider(provider.name)" />
        </div>
        <div v-if="settingsStore.activeProvider">
          <small>Set API key for {{ settingsStore.activeProvider.name }}:</small>
          <div class="textInputContainer">
            <input type="text" v-model="newProviderApiKey" @keyup.enter="handleSaveProviderApiKey" />
            <img class="saveBtn" src="../assets/save.svg" @click="handleSaveProviderApiKey" />
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-if="qrCodeUrl" class="modal-backdrop" @click.self="closeModal">
    <div class="qr-modal">
      <button class="close-button" @click="closeModal">&times;</button>
      <img :src="qrCodeUrl" alt="Settings QR Code" />
    </div>
  </div>
</template>

<style scoped>
.saveBtn,
.savedKey,
.backBtn {
  width: var(--icon-size);
  height: var(--icon-size);
  transition: 0.2s all ease-in-out;
}

.saveBtn:active,
.savedKey:active,
.backBtn:active {
  transform: scale(1.2);
}

.noKeySaved {
  opacity: 0;
}

input[type='radio'] {
  appearance: auto;
  -webkit-appearance: radio;
  cursor: pointer;
  width: 20px;
}

small,
p {
  padding-top: var(--space-xs);
}

.providerRadio {
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 70px 50px;
  align-items: center;
  padding: var(--space-xs) var(--space-md);
}

.providerRadio img,
.providerRadio input[type='radio'] {
  justify-self: center;
}

h4 {
  width: 100%;
  text-align: center;
}

.viewContainer {
  max-width: 420px;
  margin: 1rem auto;
  padding: 0 0.75rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--color-text, #1a1a1a);
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

section {
  padding: 0.5rem;
  border-bottom: 2px var(--color-border) solid;
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
  display: flex;
  flex-direction: row;
  padding-top: 0.35em;
  justify-content: end;
}

.textInputContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-md);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.qr-modal {
  position: relative;
  padding: 24px;
  background: var(--color-bg);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.qr-modal img {
  display: block;
  margin-top: 16px;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 12px;
  border: 0;
  background: none;
  font-size: 24px;
  cursor: pointer;
}
</style>
