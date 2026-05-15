<template>

  <aside class="sidebar">
    <div v-if="buscando" class="grupo">
      <p class="resultados-texto">
        {{ resultadosCount }} resultado{{ resultadosCount !== 1 ? 's' : '' }} para "{{ busqueda }}"
      </p>
    </div>

    <div class="grupo">
      <h3 class="grupo-titulo">Ordenar</h3>
      <select
        aria-label="Ordenar resultados"
        :value="ordenar"
        @change="$emit('update:ordenar', $event.target.value)"
        class="filtro-select"
      >
        <option value="defecto" disabled hidden>Selecciona...</option>
        <option value="precio-asc">Precio: Menor a Mayor</option>
        <option value="precio-desc">Precio: Mayor a Menor</option>
        <option value="nombre-asc">Nombre: A-Z</option>
        <option value="nombre-desc">Nombre: Z-A</option>
      </select>
    </div>

    <button v-if="hayFiltrosActivos" class="btn-limpiar" @click="$emit('limpiar')">
      ✕ Limpiar filtros
    </button>

    <template v-if="!buscando">

      <div class="grupo">
        <h3 class="grupo-titulo">Precio</h3>
        <RangoDoble
          :min="limites.min"
          :max="limites.max"
          :modelMin="filtros.precioMin"
          :modelMax="filtros.precioMax"
          @update:modelMin="emitir('precioMin', $event)"
          @update:modelMax="emitir('precioMax', $event)"
        />
      </div>

      <template v-if="tipo === 'videojuegos'">
        <GrupoFiltro titulo="Género" :opciones="opciones.generos" :seleccionados="filtros.generos"
          @toggle="toggleCheck('generos', $event)" />
        <GrupoFiltro titulo="Plataforma" :opciones="opciones.plataformas" :seleccionados="filtros.plataformas"
          @toggle="toggleCheck('plataformas', $event)" />
      </template>

      <template v-if="tipo === 'consolas'">
        <GrupoFiltro titulo="Fabricante" :opciones="opciones.fabricantes" :seleccionados="filtros.fabricantes"
          @toggle="toggleCheck('fabricantes', $event)" />
      </template>

      <template v-if="tipo === 'merchandising'">
        <GrupoFiltro titulo="Categoría" :opciones="opciones.categorias" :seleccionados="filtros.categorias"
          @toggle="toggleCheck('categorias', $event)" />
      </template>

    </template>
  </aside>

</template>


<script setup>

  import { computed } from 'vue'
  import GrupoFiltro from './GrupoFiltro.vue'
  import RangoDoble from './RangoDoble.vue'

  const props = defineProps({
    tipo:            String,
    opciones:        Object,
    limites:         Object,
    filtros:         Object,
    ordenar:         String,
    buscando:        Boolean,
    busqueda:        String,
    resultadosCount: Number
  })

  const emit = defineEmits(['update:filtros', 'update:ordenar', 'limpiar'])

  const hayFiltrosActivos = computed(() => {
    const f = props.filtros
    return f.generos.length > 0 || f.plataformas.length > 0 ||
          f.fabricantes.length > 0 || f.categorias.length > 0 ||
          f.precioMin > props.limites.min || f.precioMax < props.limites.max ||
          props.ordenar !== 'defecto'
  })

  const emitir = (campo, valor) => {
    emit('update:filtros', { ...props.filtros, [campo]: valor })
  }

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
    gap: 16px;
    padding: 20px;
    margin: 0;
    border: 2px solid rgba(116, 57, 179, 0.449);
    border-radius: 12px;
    align-self: flex-start;
    position: sticky;
    top: 24px;
    background-color: rgba(141, 124, 173, 0.966);
  }

  .grupo {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .grupo-titulo {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #5A2193;
    margin: 0;
    padding-bottom: 6px;
    border-bottom: 2px solid rgba(116, 57, 179, 0.2);
  }

  .resultados-texto {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    color: black;
    margin: 0;
  }

  .filtro-select {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #5A2193;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    color: black;
    cursor: pointer;
    outline: none;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .filtro-select:focus {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    border-color: #65319c;
    box-shadow: 0 0 0 3px rgba(116, 57, 179, 0.4);
  }

  .filtro-select option {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: white;
    color: black;
  }

  .btn-limpiar {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 8px 16px;
    background: white;
    color: #000000;
    border: 2px solid #5A2193;
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
      width: auto;
      min-width: unset;
      margin: 16px 24px 0;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 16px;
    }

    .grupo {
      min-width: 140px;
    }
  }

</style>