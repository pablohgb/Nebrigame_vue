import { defineStore } from 'pinia'

const DEFAULT_DURATION = 3000

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),

  actions: {
    addToast(type, message, duration = DEFAULT_DURATION) {
      const id = crypto.randomUUID()
      this.toasts.push({ id, type, message })

      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})

export const toast = {
  success: (message, duration) => useToastStore().addToast('success', message, duration),
  error: (message, duration) => useToastStore().addToast('error', message, duration)
}