// En lugar de setBusqueda, usamos v-model para que el componente SearchFilter actualice directamente la variable
busqueda en este componente.
<template>

  <div class="page-wrapper">
    <Header v-model:busqueda="busqueda" />

    <SearchFilter v-if="buscando" :resultadosCount="productos.length" :busqueda="busqueda" v-model:ordenar="ordenar"
      :onLimpiar="limpiarBusqueda" />

    <Loading v-if="isLoading" />

    <div v-else-if="productos.length === 0 && buscando" class="no-encontrado-pantalla">
      <img src="../../assets/images/ups.jpg" alt="No se encontraron productos" class="no-encontrado-imagen" />
    </div>

    <section v-else>
      <div class="productos-grid">
        <ProductCard v-for="producto in productos" :key="producto.id" :id="producto.id"
          :imagen="getImageUrl(producto.imagen_url)" :nombre="producto.nombre" :precio="producto.precio"
          :tipo="buscando ? getTipoProducto(producto) : tipo" />
      </div>
    </section>
    <Footer />
  </div>

</template>


<script setup>

import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideojuegos, useConsolas, useMerchandising } from '../../api/useProduct'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import ProductCard from '../../components/ProductCard/ProductCard.vue'
import SearchFilter from '../../components/SearchFilter/SearchFilter.vue'
import Loading from '../../components/Loading/Loading.vue'
import getImageUrl from '../../utils/getImage'

const route = useRoute()
const router = useRouter()

const tipo = computed(() => route.params.tipo)
const busqueda = ref('')
const buscando = ref(false)
const resultados = ref([])
const ordenar = ref('defecto')

const { videojuegos, loading: loadingVideojuegos } = useVideojuegos()
const { consolas, loading: loadingConsolas } = useConsolas()
const { merchandising, loading: loadingMerch } = useMerchandising()

const isLoading = computed(() => {
  if (tipo.value === 'videojuegos') return loadingVideojuegos.value
  if (tipo.value === 'consolas') return loadingConsolas.value
  if (tipo.value === 'merchandising') return loadingMerch.value
  return loadingVideojuegos.value || loadingConsolas.value || loadingMerch.value
})

const realizarBusqueda = async (termino) => {
  if (!termino.trim()) {
    buscando.value = false
    resultados.value = []
    return
  }

  buscando.value = true
  const apiUrl = import.meta.env.VITE_BACK_CONNECTION

  try {
    const res = await fetch(`${apiUrl}/buscar?q=${encodeURIComponent(termino)}`)
    const data = await res.json()
    if (data.success) resultados.value = data.resultados
  } catch (err) {
    console.error('Error en búsqueda:', err)
    resultados.value = []
  }
}

const limpiarBusqueda = () => {
  buscando.value = false
  resultados.value = []
  ordenar.value = 'defecto'
  busqueda.value = ''
  const from = route.state?.from
  const validFrom = ['/productos/consolas', '/productos/videojuegos', '/productos/merchandising'].includes(from) ? from : null
  router.replace(validFrom || '/')
}

const ordenarProductos = (lista) => {
  const copia = [...lista]
  switch (ordenar.value) {
    case 'precio-asc': return copia.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
    case 'precio-desc': return copia.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio))
    case 'nombre-asc': return copia.sort((a, b) => a.nombre.localeCompare(b.nombre))
    case 'nombre-desc': return copia.sort((a, b) => b.nombre.localeCompare(a.nombre))
    default: return copia
  }
}

const getTipoProducto = (producto) => {
  if (producto.tipo === 'juego') return 'videojuegos'
  if (producto.tipo === 'consola') return 'consolas'
  if (producto.tipo === 'merchandising') return 'merchandising'
  return tipo.value || 'videojuegos'
}

const productos = computed(() => {
  if (buscando.value) return ordenarProductos(resultados.value)
  let lista = []
  if (tipo.value === 'videojuegos') lista = videojuegos.value
  else if (tipo.value === 'consolas') lista = consolas.value
  else if (tipo.value === 'merchandising') lista = merchandising.value
  else lista = [...videojuegos.value, ...consolas.value, ...merchandising.value]
  return ordenarProductos(lista)
})

watch(() => route.query.query, (query) => {
  if (query) {
    busqueda.value = query
    realizarBusqueda(query)
  } else {
    buscando.value = false
    resultados.value = []
    busqueda.value = ''
  }
}, { immediate: true })

</script>


<style scoped>
.productos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.no-encontrado-pantalla {
  height: calc(84vh - 88px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.no-encontrado-imagen {
  width: 100%;
  max-width: 600px;
  height: auto;
  object-fit: contain;
}

/* FIXME - Arreglar formato */

@media (max-width: 1024px) {
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .productos-grid {
    grid-template-columns: 1fr;
  }
}
</style>