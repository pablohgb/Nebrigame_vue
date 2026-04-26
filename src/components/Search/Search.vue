<template>

  <div class="search-expandable">
    <form @submit.prevent="handleSubmit" :class="`search-form ${isExpanded ? 'expanded' : ''}`">
      <input
        type="text"
        placeholder="Buscar productos..."
        :value="busqueda"
        @input="$emit('update:busqueda', $event.target.value)"
        class="search-input"
      />
      <button
        :type="esSubmit ? 'submit' : 'button'"
        @click="!esSubmit ? handleToggle() : undefined"
        class="search-button"
        :aria-label="ariaLabel"
      >
        <X v-if="isExpanded && !busqueda" :size="22" />
        <SearchIcon v-else :size="22" />
      </button>
    </form>
  </div>

</template>


<script setup>

  import { ref, computed } from 'vue'
  import { Search as SearchIcon, X } from 'lucide-vue-next'

  const props = defineProps({
    busqueda: String,
    handleSearch: Function
  })

  const emit = defineEmits(['update:busqueda'])

  const isExpanded = ref(false)

  const esSubmit = computed(() => isExpanded.value && props.busqueda)

  const ariaLabel = computed(() => {
    if (esSubmit.value) return 'Buscar'
    if (isExpanded.value) return 'Cerrar búsqueda'
    return 'Abrir búsqueda'
  })

  const handleToggle = () => {
    isExpanded.value = !isExpanded.value
    if (isExpanded.value === false && props.busqueda) {
      emit('update:busqueda', '')
    }
  }

  const handleSubmit = () => {
    if (props.busqueda.trim()) {
      props.handleSearch(props.busqueda.trim())
      isExpanded.value = false
    }
  }

</script>


<style scoped>

  .search-expandable {
    display: flex;
    align-items: center;
  }

  .search-form {
    display: flex;
    align-items: center;
    position: relative;
  }

  .search-input {
    width: 0;
    opacity: 0;
    padding: 10px 14px 10px 16px;
    font-size: 14px;
    border: 2px solid #7F30BC;
    border-radius: 20px;
    background-color: rgba(127, 48, 188, 0.2);
    color: white;
    transition: all 0.4s ease;
    pointer-events: none;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .search-input:focus {
    outline: none;
    background-color: rgba(127, 48, 188, 0.3);
  }

  .search-form.expanded .search-input {
    width: 200px;
    opacity: 1;
    pointer-events: auto;
    margin-right: 8px;
  }

  .search-button {
    padding: 8px 12px;
    background: linear-gradient(135deg, #7F30BC 0%, #6525A3 100%);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    min-width: 40px;
    min-height: 40px;
    flex-shrink: 0;
  }

  .search-button:hover {
    background: linear-gradient(135deg, #6525A3 0%, #541F8B 100%);
    transform: scale(1.05);
  }

  .search-button:active {
    transform: scale(0.95);
  }

  @media (max-width: 930px) {
    .search-form.expanded .search-input {
      width: 160px;
    }
  }

  @media (max-width: 480px) {
    .search-form.expanded .search-input {
      width: 130px;
    }
  }

</style>