<template>

  <div class="page-wrapper">
    <div class="wishlist-background">
      <Header />
      <div class="wishlist-container">
        <BackButton>
          <ArrowLeft :size="24" />
        </BackButton>

        <div class="wishlist-header">
          <h1>Lista de Deseos</h1>
          <br />
          <p>
            {{ wishlist.length > 0
              ? `Tienes ${wishlist.length} producto${wishlist.length !== 1 ? 's' : ''} guardado${wishlist.length !== 1 ?
                's' : ''}`
              : 'Aún no has añadido productos a tu wishlist'
            }}
          </p>
        </div>

        <div v-if="loading" class="wishlist-loading">
          <p>Cargando tu wishlist...</p>
        </div>

        <ul v-else-if="wishlist.length > 0" class="wishlist-grid">
          <li v-for="product in wishlist" :key="product.id" class="wishlist-card"
            @click="router.push(`/producto/${getTipoProducto(product)}/${product.id}`)">
            <div class="wishlist-image-container">
              <img :src="getImageUrl(product.imagen_url)" :alt="product.nombre"
                @error="(e) => { e.target.onerror = null; e.target.src = noDisponible }" />
            </div>
            <div class="wishlist-info">
              <h2 class="wishlist-product-name">{{ product.nombre }}</h2>
              <p class="wishlist-product-price">{{ product.precio }}€</p>
              <span class="wishlist-product-type">{{ getTipoProducto(product) }}</span>
              <button class="wishlist-heart-icon" @click.stop="openConfirmModal(product)" title="Quitar de la wishlist"
                aria-label="Quitar de la wishlist">
                <Heart fill="#e74c3c" color="#e74c3c" :size="24" />
              </button>
            </div>
          </li>
        </ul>

        <div v-else class="wishlist-empty">
          <div class="wishlist-empty-icon">
            <Heart :size="64" color="#ccc" />
          </div>
          <h3>Tu wishlist está vacía</h3>
          <p>Explora nuestros productos y añade tus favoritos</p>
        </div>
      </div>
    </div>

    <Footer />

    <ConfirmModal :open="showConfirmModal" :onClose="closeConfirmModal" :onConfirm="handleConfirmRemove"
      title="Eliminar de la wishlist"
      :message="productToDelete ? `¿Eliminar ${productToDelete.nombre} de tu lista de deseos?` : ''" />
  </div>

</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, ArrowLeft } from 'lucide-vue-next'
import { useWishlist, deleteWishlist } from '../../api/useWishlist'
import { useUserStore } from '../../stores/userStore'
import { toast } from '../../stores/toastStore'
import Header from '../../components/Header/Header.vue'
import Footer from '../../components/Footer/Footer.vue'
import BackButton from '../../components/BackButton/BackButton.vue'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.vue'
import getImageUrl from '../../utils/getImage'
import noDisponible from '../../assets/images/no-disponible.jpg'

const router = useRouter()
const userStore = useUserStore()
const userId = computed(() => userStore.id)

onMounted(() => {
  if (!userId.value) {
    router.push({ path: '/login', state: { from: '/wishlist' } })
  }
})

const { wishlist, loading, refetchWishlist } = useWishlist(userId)

const showConfirmModal = ref(false)
const productToDelete = ref(null)

const getTipoProducto = (producto) => {
  if (producto.tipo === 'juego') return 'videojuegos'
  if (producto.tipo === 'consola') return 'consolas'
  if (producto.tipo === 'merchandising') return 'merchandising'
  return producto.tipo
}

const openConfirmModal = (product) => {
  productToDelete.value = { id: product.id, nombre: product.nombre }
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  productToDelete.value = null
}

const handleConfirmRemove = async () => {
  if (!productToDelete.value) return
  try {
    await deleteWishlist(userId.value, productToDelete.value.id)
    refetchWishlist()
    toast.success('Producto eliminado de la wishlist')
  } catch (err) {
    toast.error('No se pudo eliminar de la wishlist')
  }
}

</script>


<style scoped>
.wishlist-background {
  background-image: url('../../assets/images/wishlistBackground.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100dvh;
  overflow-x: hidden;
}

.wishlist-container {
  max-width: 1200px;
  width: 100%;
  margin: 40px auto 0 auto;
  padding: 2rem;
  padding-left: 96px;
  position: relative;
  box-sizing: border-box;
}

.wishlist-header {
  margin-bottom: 32px;
}

.wishlist-header h1 {
  font-size: 2rem;
  color: #f3ededf2;
  margin: 0 0 8px 0;
}

.wishlist-header p {
  color: #a8a2a2;
  font-size: 1rem;
  margin: 0;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 54px 22px;
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 60px;
}

.wishlist-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  transition: transform 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  cursor: pointer;
}

.wishlist-card:hover {
  transform: translateY(-4px);
}

.wishlist-heart-icon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wishlist-heart-icon:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
}

.wishlist-heart-icon:active {
  transform: scale(1);
}

.wishlist-image-container {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
  background: #ffffff;
}

.wishlist-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.wishlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wishlist-product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wishlist-product-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.wishlist-product-type {
  font-size: 0.8rem;
  color: #999;
  text-transform: capitalize;
  margin: 0;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.wishlist-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.wishlist-empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  opacity: 0.5;
}

.wishlist-empty h3 {
  font-size: 1.5rem;
  color: #666;
  margin: 0 0 8px 0;
}

.wishlist-empty p {
  font-size: 1rem;
  color: #999;
  margin: 0;
}

.wishlist-loading {
  text-align: center;
  padding: 60px 20px;
  color: #667eea;
  font-size: 1.1rem;
}

@media (max-width: 1226px) {
  .wishlist-container {
    padding-left: 60px;
  }

  .wishlist-grid {
    gap: 40px 20px;
  }
}

@media (max-width: 1150px) {
  .wishlist-container {
    padding-left: 40px;
  }

  .wishlist-header {
    padding-top: 60px;
  }
}

@media (max-width: 1098px) {
  .wishlist-container {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 980px) {
  .wishlist-container {
    padding: 24px 16px;
  }

  .wishlist-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .wishlist-header h1 {
    font-size: 1.5rem;
  }

  .wishlist-card {
    padding: 12px;
  }

  .wishlist-image-container {
    height: 120px;
  }

  .wishlist-product-name {
    font-size: 0.85rem;
  }

  .wishlist-info {
    padding-bottom: 35px;
  }
}

@media (max-width: 780px) {
  .wishlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .wishlist-container {
    padding: 20px 16px;
  }

  .wishlist-grid {
    grid-template-columns: 1fr;
    margin-top: 40px;
    gap: 2.6rem;
    justify-items: center;
  }

  .wishlist-card {
    width: 100%;
    max-width: 280px;
  }
}
</style>