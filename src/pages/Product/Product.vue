<template>
  <div class="page-wrapper">
    <Header v-model:busqueda="busqueda" />

    <Loading v-if="isLoading" />

    <div v-else-if="productos.length === 0 && buscando" class="no-encontrado-pantalla">
      <img src="../../assets/images/ups.jpg" alt="No se encontraron productos" class="no-encontrado-imagen" />
    </div>

    <div v-else class="catalogo-layout">
      <SidebarFiltros
        v-if="tipo || buscando"
        :tipo="tipo"
        :opciones="opcionesFiltro"
        :limites="limitesPrecios"
        :buscando="buscando"
        :busqueda="busqueda"
        :resultadosCount="productos.length"
        :ordenar="ordenar"
        v-model:filtros="filtros"
        v-model:ordenar="ordenar"
        @limpiar="limpiarFiltros"
      />
      <section class="productos-seccion">
        <div class="productos-grid">
          <ProductCard v-for="producto in productos" :key="producto.id" :id="producto.id"
            :imagen="getImageUrl(producto.imagen_url)" :nombre="producto.nombre" :precio="producto.precio"
            :tipo="buscando ? getTipoProducto(producto) : tipo" />
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideojuegos, useConsolas, useMerchandising } from '../../api/useProduct'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import ProductCard from '../../components/ProductCard/ProductCard.vue'
import SidebarFiltros from '../../components/SidebarFiltros/SidebarFiltros.vue'
import Loading from '../../components/Loading/Loading.vue'
import getImageUrl from '../../utils/getImage'
import { getNavigationHistoryState } from '../../utils/navigationState'
import { useScrollStore } from '../../stores/scroll'

const route = useRoute()
const router = useRouter()
const scrollStore = useScrollStore()

const tipo = computed(() => route.params.tipo)
const busqueda = ref('')
const buscando = ref(false)
const resultados = ref([])
const ordenar = ref('defecto')

const filtros = ref({
  generos: [], plataformas: [], fabricantes: [], categorias: [],
  precioMin: 0, precioMax: 9999
})

const { videojuegos, loading: loadingVideojuegos } = useVideojuegos()
const { consolas, loading: loadingConsolas } = useConsolas()
const { merchandising, loading: loadingMerch } = useMerchandising()

const isLoading = computed(() => {
  if (tipo.value === 'videojuegos') return loadingVideojuegos.value
  if (tipo.value === 'consolas') return loadingConsolas.value
  if (tipo.value === 'merchandising') return loadingMerch.value
  return loadingVideojuegos.value || loadingConsolas.value || loadingMerch.value
})

const opcionesFiltro = computed(() => ({
  generos:     [...new Set(videojuegos.value.map(p => p.juego?.genero).filter(Boolean))].sort(),
  plataformas: [...new Set(videojuegos.value.flatMap(p => p.juego?.plataformas?.map(pl => pl.nombre) ?? []))].sort(),
  fabricantes: [...new Set(consolas.value.map(p => p.consola?.fabricante).filter(Boolean))].sort(),
  categorias:  [...new Set(merchandising.value.map(p => p.merchandising?.categoria).filter(Boolean))].sort()
}))

const limitesPrecios = computed(() => {
  let lista = []
  if (tipo.value === 'videojuegos') lista = videojuegos.value
  else if (tipo.value === 'consolas') lista = consolas.value
  else if (tipo.value === 'merchandising') lista = merchandising.value
  if (lista.length === 0) return { min: 0, max: 9999 }
  const precios = lista.map(p => parseFloat(p.precio))
  return { min: Math.floor(Math.min(...precios)), max: Math.ceil(Math.max(...precios)) }
})

const limpiarFiltros = () => {
  ordenar.value = 'defecto'
  filtros.value = {
    generos: [], plataformas: [], fabricantes: [], categorias: [],
    precioMin: limitesPrecios.value.min,
    precioMax: limitesPrecios.value.max
  }
}

watch(tipo, () => {
  limpiarFiltros()
})

watch(limitesPrecios, (limites) => {
  filtros.value.precioMin = limites.min
  filtros.value.precioMax = limites.max
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
  const fromRaw = getNavigationHistoryState().from
  const from = typeof fromRaw === 'string' ? fromRaw : undefined
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

const aplicarFiltros = (lista, tipoActual) => {
  const f = filtros.value
  return lista.filter(p => {
    const precio = parseFloat(p.precio)
    if (precio < f.precioMin || precio > f.precioMax) return false
    if (tipoActual === 'videojuegos') {
      if (f.generos.length > 0 && !f.generos.includes(p.juego?.genero)) return false
      if (f.plataformas.length > 0) {
        const nombresPlat = p.juego?.plataformas?.map(pl => pl.nombre) ?? []
        if (!f.plataformas.some(pl => nombresPlat.includes(pl))) return false
      }
    }
    if (tipoActual === 'consolas' && f.fabricantes.length > 0) {
      if (!f.fabricantes.includes(p.consola?.fabricante)) return false
    }
    if (tipoActual === 'merchandising' && f.categorias.length > 0) {
      if (!f.categorias.includes(p.merchandising?.categoria)) return false
    }
    return true
  })
}

const productos = computed(() => {
  if (buscando.value) return ordenarProductos(resultados.value)
  let lista = []
  if (tipo.value === 'videojuegos') lista = videojuegos.value
  else if (tipo.value === 'consolas') lista = consolas.value
  else if (tipo.value === 'merchandising') lista = merchandising.value
  else lista = [...videojuegos.value, ...consolas.value, ...merchandising.value]
  return ordenarProductos(aplicarFiltros(lista, tipo.value))
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

watch(isLoading, async (cargando) => {
  if (!cargando) {
    await nextTick()
    window.scrollTo(0, scrollStore.posicion)
  }
})

onBeforeUnmount(() => {
  scrollStore.posicion = window.scrollY
})
</script>

<style scoped>
.catalogo-layout {
  display: flex;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
}

.productos-seccion {
  flex: 1;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 24px;
}

.no-encontrado-pantalla {
  flex: 1;
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

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-wrapper section {
  flex: 1;
}

@media (max-width: 1024px) {
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .catalogo-layout {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .productos-grid {
    grid-template-columns: 1fr;
  }
}
</style>