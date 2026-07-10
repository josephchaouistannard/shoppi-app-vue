import { ref } from 'vue'

type Toast = {
  message:string,
  id:string,
  type: 'success'| 'error' | 'info' | 'warn'
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const addToast = (message: string, type: 'success'|'error'|'info' | 'warn' = 'info', duration: number = 3000) => {
    const id = crypto.randomUUID()
    toasts.value.push({
      message, type, id
    })

    // Auto-remove after the duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
