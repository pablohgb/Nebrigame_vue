<template>

  <div v-if="open" class="confirm-modal-overlay" @click="handleOverlayClick">
    <div class="confirm-modal-content" @click.stop>
      <h3 class="confirm-modal-title">{{ title }}</h3>
      <p class="confirm-modal-message">{{ message }}</p>
      <div class="confirm-modal-actions">
        <button type="button" class="confirm-modal-btn confirm-modal-btn-cancel" @click="onClose">
          {{ cancelLabel }}
        </button>
        <button type="button" class="confirm-modal-btn confirm-modal-btn-confirm" @click="handleConfirm">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>

</template>


<script setup>

  const props = defineProps({
    open: Boolean,
    onClose: Function,
    onConfirm: Function,
    title: String,
    message: String,
    confirmLabel: { type: String, default: 'Eliminar' },
    cancelLabel: { type: String, default: 'Cancelar' }
  })

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      props.onClose()
    }
  }

  const handleConfirm = () => {
    props.onConfirm()
    props.onClose()
  }

</script>


<style scoped>

  .confirm-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .confirm-modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .confirm-modal-title {
    margin: 0 0 12px 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .confirm-modal-message {
    margin: 0 0 24px 0;
    font-size: 1rem;
    color: #555;
    line-height: 1.5;
  }

  .confirm-modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .confirm-modal-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s, color 0.2s;
  }

  .confirm-modal-btn-cancel {
    background: #f0f0f0;
    color: #333;
  }

  .confirm-modal-btn-cancel:hover {
    background: #e0e0e0;
  }

  .confirm-modal-btn-confirm {
    background: #e74c3c;
    color: white;
  }

  .confirm-modal-btn-confirm:hover {
    background: #c0392b;
  }
  
</style>