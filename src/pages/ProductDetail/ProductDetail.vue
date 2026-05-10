<template>

  <div class="page-wrapper">
    <Header />
    <div v-if="loading">
      <Loading />
    </div>
    <div v-else-if="!producto">
      <NotFound />
    </div>

    <template v-else>
      <div class="contenedor-detalle">
        <BackButton>
          <ArrowLeft :size="24" />
        </BackButton>

        <div class="contenedor-principal">
          <div class="detalle">
            <div :class="`imagen-container imagen-container--${tipo}`">
              <img :src="getImageUrl(producto.imagen_url)" :alt="producto.nombre"
                :class="`imagen ${isFallback ? 'imagen--fallback' : ''}`" @error="handleImageError" />
            </div>

            <div class="info">
              <h1>{{ producto.nombre }}</h1>

              <div class="precio-row">
                <p class="precio">{{ producto.precio }} €</p>
                <PlataformaDropdown v-if="tipo === 'videojuegos' && plataformas && plataformas.length > 0"
                  :plataformas="plataformas" :plataformaSeleccionada="plataformaSeleccionada"
                  :onSeleccionar="(id) => plataformaSeleccionada = id" />
              </div>

              <div class="botones">
                <button class="boton-wishlist" @click="handleToggleWishlist(producto.id, producto.nombre)"
                  :disabled="isUpdating || loadingWishlist"
                  :title="localIsInWishlist ? 'Quitar de la wishlist' : 'Añadir a la wishlist'">
                  <Heart :size="24" :fill="localIsInWishlist ? '#e74c3c' : 'none'"
                    :color="localIsInWishlist ? '#e74c3c' : 'white'" />
                </button>

                <button v-if="loadingStock" class="boton-carrito" disabled>Cargando...</button>
                <button v-else-if="stockDisponible > 0" class="boton-carrito"
                  @click="handleAddToCart(producto.id, tipo === 'videojuegos' ? plataformaSeleccionada : null)"
                  :disabled="isUpdating">
                  Añadir al carrito
                </button>
                <button v-else class="boton-aviso-reposicion" @click="handleAvisoReposicion">
                  Recibir un email cuando se reponga stock
                </button>
              </div>
            </div>
          </div>

          <div class="seccion-descripcion">
            <h2>Acerca de</h2>
            <p class="descripcion">{{ producto.descripcion || 'Descripción no disponible' }}</p>

            <div class="especificaciones">
              <template v-if="tipo === 'videojuegos' && producto.juego">
                <div class="dato">
                  <span class="etiqueta">Género:</span>
                  <span class="valor">{{ producto.juego.genero }}</span>
                </div>
                <div class="dato">
                  <span class="etiqueta">Edad mínima:</span>
                  <span class="valor">{{ producto.juego.edad_minima }}+</span>
                </div>
                <div v-if="producto.juego.plataformas?.length > 0" class="dato">
                  <span class="etiqueta">Plataformas disponibles:</span>
                  <div class="lista-plataformas">
                    <span v-for="p in producto.juego.plataformas" :key="p.id" class="plataforma">{{ p.nombre }}</span>
                  </div>
                </div>
              </template>

              <template v-if="tipo === 'consolas' && producto.consola">
                <div class="dato">
                  <span class="etiqueta">Fabricante:</span>
                  <span class="valor">{{ producto.consola.fabricante }}</span>
                </div>
                <div class="dato">
                  <span class="etiqueta">Capacidad:</span>
                  <span class="valor">{{ producto.consola.capacidad_almacenamiento }}</span>
                </div>
                <div v-if="producto.consola.plataforma" class="dato">
                  <span class="etiqueta">Plataforma:</span>
                  <span class="valor">{{ producto.consola.plataforma.nombre }}</span>
                </div>
                <div v-if="producto.consola.color" class="dato">
                  <span class="etiqueta">Color:</span>
                  <span class="valor">{{ producto.consola.color }}</span>
                </div>
              </template>

              <template v-if="tipo === 'merchandising' && producto.merchandising">
                <div class="dato">
                  <span class="etiqueta">Categoría:</span>
                  <span class="valor">{{ producto.merchandising.categoria }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </template>

    <ConfirmModal :open="showConfirmModal" :onClose="() => { showConfirmModal = false; productToDeleteModal = null }"
      :onConfirm="handleConfirmRemoveWishlist" title="Eliminar de la wishlist"
      :message="productToDeleteModal ? `¿Eliminar ${productToDeleteModal.nombre} de tu lista de deseos?` : ''" />
  </div>

</template>


<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, ArrowLeft } from 'lucide-vue-next'
import { useVideojuegos, useConsolas, useMerchandising, useProductStock } from '../../api/useProduct'
import { useIsInWishlist, addWishlist, deleteWishlist } from '../../api/useWishlist'
import { addCart } from '../../api/useCart'
import { useUserStore } from '../../stores/userStore'
import { toast } from '../../stores/toastStore'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import Loading from '../../components/Loading/Loading.vue'
import BackButton from '../../components/BackButton/BackButton.vue'
import PlataformaDropdown from '../../components/PlataformaDropdown/PlataformaDropdown.vue'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.vue'
import NotFound from '../NotFound/NotFound.vue'
import getImageUrl from '../../utils/getImage'
import noDisponible from '../../assets/images/no-disponible.jpg'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tipo = computed(() => route.params.tipo)
const id = computed(() => route.params.id)
const userId = computed(() => userStore.id)

const { isInWishlist, loading: loadingWishlist } = useIsInWishlist(userId, id)
const productoId = computed(() => id.value ? parseInt(id.value, 10) : null)
const { stock, plataformas, loading: loadingStock } = useProductStock(productoId)

const isUpdating = ref(false)
const localIsInWishlist = ref(false)
const plataformaSeleccionada = ref(null)
const showConfirmModal = ref(false)
const productToDeleteModal = ref(null)
const isFallback = ref(false)

const { videojuegos, loading: loadingVideojuegos } = useVideojuegos()
const { consolas, loading: loadingConsolas } = useConsolas()
const { merchandising, loading: loadingMerch } = useMerchandising()

const loading = computed(() => {
  if (tipo.value === 'videojuegos') return loadingVideojuegos.value
  if (tipo.value === 'consolas') return loadingConsolas.value
  if (tipo.value === 'merchandising') return loadingMerch.value
  return false
})

const producto = computed(() => {
  const idNum = parseInt(id.value)
  if (tipo.value === 'videojuegos') return videojuegos.value.find(p => p.id === idNum)
  if (tipo.value === 'consolas') return consolas.value.find(p => p.id === idNum)
  if (tipo.value === 'merchandising') return merchandising.value.find(p => p.id === idNum)
  return null
})

const stockDisponible = computed(() => {
  if (tipo.value === 'videojuegos') {
    if (Array.isArray(plataformas.value) && plataformas.value.length > 0 && plataformaSeleccionada.value) {
      const p = plataformas.value.find(p => String(p.id) === String(plataformaSeleccionada.value))
      return p ? (Number(p.control_stock) || 0) : 0
    }
    return 0
  }
  return stock.value
})

watch(isInWishlist, (val) => { localIsInWishlist.value = val })

watch([tipo, plataformas], () => {
  if (tipo.value === 'videojuegos' && Array.isArray(plataformas.value) && plataformas.value.length > 0) {
    const exists = plataformaSeleccionada.value && plataformas.value.some(p => String(p.id) === String(plataformaSeleccionada.value))
    if (!exists) plataformaSeleccionada.value = String(plataformas.value[0].id)
  } else {
    plataformaSeleccionada.value = null
  }
})

watch([id, tipo], () => { window.scrollTo(0, 0) })

const handleImageError = (e) => {
  e.target.onerror = null
  e.target.src = noDisponible
  isFallback.value = true
}

const handleToggleWishlist = (productId, productName) => {
  if (isUpdating.value) return
  if (localIsInWishlist.value) {
    productToDeleteModal.value = { id: productId, nombre: productName }
    showConfirmModal.value = true
  } else {
    handleAddToWishlist(productId)
  }
}

const handleConfirmRemoveWishlist = async () => {
  if (!productToDeleteModal.value) return
  isUpdating.value = true
  try {
    await deleteWishlist(userId.value, productToDeleteModal.value.id)
    localIsInWishlist.value = false
    toast.success('Producto eliminado de la wishlist')
  } catch {
    toast.error('No se pudo eliminar de la wishlist')
  } finally {
    isUpdating.value = false
    productToDeleteModal.value = null
  }
}

const handleAddToWishlist = async (productId) => {
  // Verificamos primero que el usuario esté logueado 
  if (!userStore.id) {
    toast.error('¡Tu lista de deseos te está esperando, inicia sesión!')
    return
  }

  isUpdating.value = true
  try {
    await addWishlist(userStore.id, productId)
    localIsInWishlist.value = true
    toast.success('Producto añadido a la wishlist')
  } catch (error) {
    toast.error('No se pudo añadir a la wishlist')
  } finally {
    isUpdating.value = false
  }
}

const handleAddToCart = async (productId, plataformaId = null) => {
  // Verificamos primero que el usuario esté logueado 
  if (!userStore.id) {
    toast.error('¡Necesitas iniciar sesión para añadir al carrito, jugador!')
    return
  }

  if (isUpdating.value) return
  isUpdating.value = true
  try {
    await addCart(userStore.id, productId, 1, plataformaId)
    toast.success('Producto añadido al carrito')
  } catch (error) {
    toast.error(error.message || 'No se pudo añadir al carrito')
  } finally {
    isUpdating.value = false
  }
}

const handleAvisoReposicion = () => {
  toast.success('Te avisaremos cuando repongamos, muchas gracias')
}

onMounted(() => {
  window.scrollTo(0, 0)
})

</script>


<style scoped>

  .page-wrapper {
    display: flex;
    flex-direction: column;
    background-image:
      linear-gradient(rgba(34, 33, 33, 0.582), rgba(34, 33, 33, 0.582)),
      url("../../assets/images/backgroundProductos.jpg");
    background-repeat: repeat-x round;
    background-size: 400px 400px;
    min-height: 100vh;
  }

  .page-wrapper .contenedor-detalle {
    flex: 1;
  }

  .contenedor-detalle {
    max-width: 1200px;
    margin: 40px auto;
    padding: 24px;
    padding-left: 96px;
    position: relative;
  }

  .contenedor-principal {
    width: 100%;
  }

  .detalle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    background: #8a63b4;
    border-radius: 12px;
    padding: 30px 40px;
    margin-bottom: 24px;
    align-items: start;
  }

  .imagen {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    border-radius: 8px;
    background-color: white;
    align-self: start;
  }

  .imagen-container--videojuegos .imagen {
    object-fit: cover;
  }

  .imagen-container--videojuegos .imagen--fallback {
    object-fit: contain;
  }

  .info {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .info h1 {
    color: white;
    font-size: 32px;
    margin-bottom: 16px;
  }

  .precio-row {
    display: flex;
    align-items: center;
    gap: 90px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .precio {
    color: white;
    font-size: 36px;
    font-weight: bold;
    margin: 0;
  }

  .botones {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-top: auto;
  }

  .boton-wishlist {
    background: #7439b3;
    border: none;
    color: white;
    padding: 16px 20px;
    font-size: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
  }

  .boton-wishlist:hover {
    background: #65319c;
  }

  .boton-carrito {
    background: #7439b3;
    color: white;
    border: none;
    padding: 16px 32px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    flex: 1;
    height: 56px;
  }

  .boton-carrito:hover {
    background: #65319c;
  }

  .boton-aviso-reposicion {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.5);
    padding: 16px 32px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    height: 56px;
  }

  .boton-aviso-reposicion:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.7);
  }

  .seccion-descripcion {
    background: #8a63b4;
    border-radius: 12px;
    padding: 30px 40px;
  }

  .seccion-descripcion h2 {
    color: white;
    font-size: 24px;
    margin-bottom: 16px;
  }

  .descripcion {
    color: white;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .especificaciones {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .dato {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .etiqueta {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
  }

  .valor {
    color: white;
    font-size: 16px;
    font-weight: 600;
  }

  .lista-plataformas {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .plataforma {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .contenedor-detalle {
      padding: 16px;
      padding-top: 88px;
    }

    .detalle {
      grid-template-columns: 1fr;
    }

    .precio-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .especificaciones {
      grid-template-columns: 1fr;
    }

    .botones {
      flex-direction: column;
    }

    .boton-wishlist,
    .boton-carrito,
    .boton-aviso-reposicion {
      width: 100%;
    }
  }

</style>