<template>
  <aside class="sidebar">

    <!-- PRECIO -->
    <div class="grupo">
      <h3 class="grupo-titulo">Precio</h3>
      <div class="rango-labels">
        <span>{{ filtros.precioMin }}€</span>
        <span>{{ filtros.precioMax }}€</span>
      </div>
      <input type="range" :min="limites.min" :max="limites.max" :value="filtros.precioMin"
        @input="emitir('precioMin', +$event.target.value)" class="slider" />
      <input type="range" :min="limites.min" :max="limites.max" :value="filtros.precioMax"
        @input="emitir('precioMax', +$event.target.value)" class="slider" />
    </div>

    <!-- VIDEOJUEGOS: género + plataforma -->
    <template v-if="tipo === 'videojuegos'">
      <div class="grupo">
        <h3 class="grupo-titulo">Género</h3>
        <label v-for="opcion in opciones.generos" :key="opcion" class="check-label">
          <input type="checkbox" :value="opcion" :checked="filtros.generos.includes(opcion)"
            @change="toggleCheck('generos', opcion)" />
          {{ opcion }}
        </label>
      </div>
      <div class="grupo">
        <h3 class="grupo-titulo">Plataforma</h3>
        <label v-for="opcion in opciones.plataformas" :key="opcion" class="check-label">
          <input type="checkbox" :value="opcion" :checked="filtros.plataformas.includes(opcion)"
            @change="toggleCheck('plataformas', opcion)" />
          {{ opcion }}
        </label>
      </div>
    </template>

    <!-- CONSOLAS: fabricante -->
    <template v-if="tipo === 'consolas'">
      <div class="grupo">
        <h3 class="grupo-titulo">Fabricante</h3>
        <label v-for="opcion in opciones.fabricantes" :key="opcion" class="check-label">
          <input type="checkbox" :value="opcion" :checked="filtros.fabricantes.includes(opcion)"
            @change="toggleCheck('fabricantes', opcion)" />
          {{ opcion }}
        </label>
      </div>
    </template>

    <!-- MERCHANDISING: categoría -->
    <template v-if="tipo === 'merchandising'">
      <div class="grupo">
        <h3 class="grupo-titulo">Categoría</h3>
        <label v-for="opcion in opciones.categorias" :key="opcion" class="check-label">
          <input type="checkbox" :value="opcion" :checked="filtros.categorias.includes(opcion)"
            @change="toggleCheck('categorias', opcion)" />
          {{ opcion }}
        </label>
      </div>
    </template>

    <!-- LIMPIAR -->
    <button v-if="hayFiltrosActivos" class="btn-limpiar" @click="$emit('limpiar')">
      ✕ Limpiar filtros
    </button>

  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tipo:    String,
  opciones: Object,   // { generos, plataformas, fabricantes, categorias }
  limites:  Object,   // { min, max } — rango de precios real de los productos
  filtros:  Object    // { generos, plataformas, fabricantes, categorias, precioMin, precioMax }
})

const emit = defineEmits(['update:filtros', 'limpiar'])

const hayFiltrosActivos = computed(() => {
  const f = props.filtros
  return f.generos.length > 0 || f.plataformas.length > 0 ||
         f.fabricantes.length > 0 || f.categorias.length > 0 ||
         f.precioMin > props.limites.min || f.precioMax < props.limites.max
})

// Emite el objeto filtros completo con un campo actualizado
const emitir = (campo, valor) => {
  emit('update:filtros', { ...props.filtros, [campo]: valor })
}

// Añade o quita un valor de un array dentro de filtros
const toggleCheck = (campo, valor) => {
  const actuales = [...props.filtros[campo]]
  const indice = actuales.indexOf(valor)
  if (indice === -1) actuales.push(valor)
  else actuales.splice(indice, 1)
  emitir(campo, actuales)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0 24px 24px;
}

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
  border-bottom: 2px solid #f0e6ff;
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

.rango-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
}

.slider {
  width: 100%;
  accent-color: #7439b3;
  cursor: pointer;
}

.btn-limpiar {
  padding: 8px 16px;
  background: white;
  color: #7439b3;
  border: 2px solid #7439b3;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-limpiar:hover {
  background: #7439b3;
  color: white;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-width: unset;
    padding: 0 24px;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .grupo {
    min-width: 140px;
  }
}
</style>