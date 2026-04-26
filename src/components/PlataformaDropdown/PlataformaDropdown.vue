<template>

  <div class="plataforma-container">
    <span :class="`plataforma-trigger ${isOpen ? 'active' : ''}`" @click="isOpen = !isOpen">
      {{ plataformaActual?.nombre ?? 'Selecciona plataforma' }}
    </span>

    <div v-if="isOpen" class="plataforma-dropdown">
      <button v-for="p in plataformas" :key="p.id" :class="String(p.id) === String(plataformaSeleccionada) ? 'selected' : ''" @click="seleccionar(p.id)">
        {{ p.nombre }}
      </button>
    </div>
  </div>

</template>


<script setup>

  import { ref, computed, onMounted, onUnmounted } from 'vue'

  const props = defineProps({
    plataformas: Array,
    plataformaSeleccionada: [String, Number],
    onSeleccionar: Function
  })

  const isOpen = ref(false)

  const plataformaActual = computed(() =>
    props.plataformas.find(p => String(p.id) === String(props.plataformaSeleccionada))
  )

  const seleccionar = (id) => {
    props.onSeleccionar(String(id))
    isOpen.value = false
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.plataforma-container')) {
      isOpen.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleClickOutside))
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

</script>


<style scoped>

  .plataforma-container {
    position: relative;
  }

  .plataforma-trigger {
    color: #ecf0f1;
    font-weight: 500;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    font-family: inherit;
    font-size: 0.95rem;
    user-select: none;
  }

  .plataforma-trigger::after {
    content: "▾";
    font-size: 14px;
    margin-left: 6px;
    transition: transform 0.2s ease;
  }

  .plataforma-trigger.active::after {
    transform: rotate(180deg);
  }

  .plataforma-trigger:hover,
  .plataforma-trigger.active {
    background-color: #7F30BC;
    border-color: #6c00be;
  }

  .plataforma-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background-color: #2c3e50;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    min-width: 180px;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .plataforma-dropdown button {
    padding: 12px 20px;
    color: #ecf0f1;
    font-size: 14px;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease;
    font-family: inherit;
    white-space: nowrap;
    width: 100%;
    box-sizing: border-box;
  }

  .plataforma-dropdown button:hover {
    background-color: #7F30BC;
  }

  .plataforma-dropdown button.selected {
    background-color: #65319c;
    font-weight: 700;
  }
  
</style>