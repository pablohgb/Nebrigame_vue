<template>
  <div class="grupo">
    <h3 class="grupo-titulo">{{ titulo }}</h3>

    <label v-for="opcion in visibles" :key="opcion" class="check-label">
      <input type="checkbox" :value="opcion" :checked="seleccionados.includes(opcion)"
        @change="$emit('toggle', opcion)" />
      {{ opcion }}
    </label>

    <button v-if="opciones.length > limite" class="btn-ver-mas" @click="expandido = !expandido">
      {{ expandido ? '▲ Ver menos' : `▼ Ver ${opciones.length - limite} más` }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  titulo:        String,
  opciones:      Array,
  seleccionados: Array
})

defineEmits(['toggle'])

const limite = 3
const expandido = ref(false)

const visibles = computed(() =>
  expandido.value ? props.opciones : props.opciones.slice(0, limite)
)
</script>

<style scoped>
.grupo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grupo-titulo {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7439b3;
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 2px solid rgba(116, 57, 179, 0.2);
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: black;
  cursor: pointer;
}

.check-label input[type="checkbox"] {
  accent-color: #7439b3;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn-ver-mas {
  background: none;
  border: none;
  color: #7439b3;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 0;
  text-align: left;
  transition: color 0.2s;
}

.btn-ver-mas:hover {
  color: #65319c;
}
</style>