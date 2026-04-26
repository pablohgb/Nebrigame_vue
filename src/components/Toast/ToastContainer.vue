<template>

  <div v-if="toastStore.toasts.length > 0" class="toast-container" aria-live="polite">
    <div v-for="t in toastStore.toasts" :key="t.id" :class="`toast-item toast-${t.type}`" role="alert">
      <CheckCircle v-if="t.type === 'success'" :size="20" class="toast-icon" />
      <XCircle v-if="t.type === 'error'" :size="20" class="toast-icon" />
      <span class="toast-message">{{ t.message }}</span>
      <button type="button" class="toast-close" @click="toastStore.removeToast(t.id)" aria-label="Cerrar">
        <X :size="16" />
      </button>
    </div>
  </div>

</template>


<script setup>

  import { CheckCircle, XCircle, X } from 'lucide-vue-next'
  import { useToastStore } from '../../stores/toastStore'

  const toastStore = useToastStore()

</script>


<style scoped>

  .toast-container {
    position: fixed;
    top: 128px;
    right: 24px;
    left: auto;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 360px;
    width: max-content;
    pointer-events: none;
  }

  .toast-container > * {
    pointer-events: auto;
  }

  .toast-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: #4c70ff9d;
    animation: toastSlideIn 0.3s ease-out;
  }

  .toast-item.toast-success {
    border-left: 4px solid #7F30BC;
  }

  .toast-item.toast-success .toast-icon {
    color: #23b889;
    flex-shrink: 0;
  }

  .toast-item.toast-error {
    border-left: 4px solid #e74c3c;
  }

  .toast-item.toast-error .toast-icon {
    color: #e74c3c;
    flex-shrink: 0;
  }

  .toast-message {
    flex: 1;
    font-size: 0.95rem;
    color: #ffffff;
  }

  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .toast-close:hover {
    color: #333;
    background: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    .toast-container {
      top: 100px;
      right: 16px;
      max-width: min(360px, calc(100vw - 32px));
    }
  }

  @media (max-width: 480px) {
    .toast-container {
      top: 92px;
      left: 16px;
      right: 16px;
      max-width: none;
      width: auto;
    }

    .toast-item {
      padding: 12px 14px;
    }

    .toast-message {
      font-size: 0.9rem;
    }

    .toast-close {
      padding: 8px;
      min-width: 44px;
      min-height: 44px;
    }
  }

  @keyframes toastSlideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
</style>