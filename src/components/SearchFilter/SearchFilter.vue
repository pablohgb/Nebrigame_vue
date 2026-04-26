<template>
  
  <div class="search-filter-wrapper">
    <p class="resultados-texto">
      {{ resultadosCount }} resultado{{ resultadosCount !== 1 ? 's' : '' }} para "{{ busqueda }}"
    </p>

    <div class="filtros-container">
      <button type="button" class="limpiar-btn" @click="onLimpiar">
        Limpiar búsqueda
      </button>
      <select
        id="ordenar"
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
  </div>

</template>


<script setup>

  const props = defineProps({
    resultadosCount: Number,
    busqueda: String,
    ordenar: String,
    onLimpiar: Function
  })

  defineEmits(['update:ordenar'])

</script>


<style scoped>

  .search-filter-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 16px auto 0;
    padding: 0 24px;
  }

  .resultados-texto {
    color: black;
    font-size: 14px;
    margin: 0;
    min-height: 40px;
    display: flex;
    align-items: center;
  }

  .filtros-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filtro-select {
    width: 220px;
    padding: 8px 12px;
    border: 2px solid #7439b3;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    color: black;
    cursor: pointer;
    outline: none;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .filtro-select:focus {
    border-color: #65319c;
    box-shadow: 0 0 0 3px rgba(116, 57, 179, 0.4);
  }

  .filtro-select option {
    background: white;
    color: black;
  }

  .limpiar-btn {
    padding: 8px 16px;
    background: #7439b3;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .limpiar-btn:hover {
    background: #65319c;
  }

  @media (max-width: 768px) {
    .search-filter-wrapper {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      text-align: center;
    }

    .resultados-texto {
      width: fit-content;
      align-self: center;
    }

    .filtros-container {
      flex-direction: column;
      width: 100%;
    }

    .filtro-select {
      flex: 1;
      width: auto;
      order: 1;
    }

    .limpiar-btn {
      flex: 1;
      width: auto;
      order: 2;
    }
  }

  @media (max-width: 480px) {
    .search-filter-wrapper {
      padding: 15px 0;
    }

    .resultados-texto {
      font-size: 16px;
    }

    .filtro-select {
      min-width: unset;
      font-size: 13px;
      padding: 8px 12px;
    }

    .limpiar-btn {
      font-size: 13px;
      padding: 8px 12px;
    }
  }

</style>