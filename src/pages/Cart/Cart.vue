<template>

  <div class="page-wrapper">
    <div class="cart-page">
      <CartHeader :pasoActual="1" />

      <div class="cart-container">
        <div v-if="cartLoading" class="my-cart">
          <div class="empty-cart">
            <div class="empty-cart-icon">⏳</div>
            <h3>Cargando carrito...</h3>
          </div>
        </div>

        <div v-else-if="productosCarrito.length > 0" class="cart-content">
          <div class="my-cart">
            <h2>Carrito</h2>
            <div class="cart-products">
              <div v-for="producto in productosCarrito" :key="producto.id" class="product-item-cart">
                <img :src="producto.imagen" :alt="producto.nombre" class="product-image-cart"
                  @error="(e) => { e.target.onerror = null; e.target.src = noDisponible }" />
                <div class="product-info-cart">
                  <h3 class="product-name-cart">
                    {{ producto.nombre }}
                    <span v-if="producto.plataformaNombre" class="producto-plataforma-cart"> ({{
                      producto.plataformaNombre }})</span>
                  </h3>
                  <div class="product-price-container-cart">
                    <span class="product-price-cart">{{ producto.precio.toFixed(2) }}€</span>
                    <div class="product-actions-cart">
                      <button class="btn-icon-cart btn-minus-cart" @click="restarProducto(producto)"
                        title="Restar producto" type="button">
                        <Minus :size="18" />
                      </button>
                      <input type="number" min="1" class="product-quantity-cart product-quantity-input-cart"
                        :value="editingQuantity[getItemKey(producto)] ?? producto.cantidad"
                        @change="(e) => editingQuantity[getItemKey(producto)] = e.target.value"
                        @blur="commitQuantityInput(producto)" @keydown.enter="(e) => e.target.blur()"
                        :aria-label="`Cantidad de ${producto.nombre}`" />
                      <button class="btn-icon-cart btn-add-cart" @click="sumarProducto(producto)"
                        title="Añadir producto" type="button">
                        <Plus :size="18" />
                      </button>
                      <button class="btn-icon-cart btn-delete-cart" @click="openConfirmModal(producto)" type="button"
                        title="Eliminar del carrito">
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h2>Resumen</h2>
            <div class="summary-content-cart">
              <div class="summary-detail-cart">
                <h3>Total productos</h3>
                <div class="summary-line-cart">
                  <span>Subtotal</span>
                  <span>{{ calcularTotal() }}€</span>
                </div>
                <div class="summary-line-cart">
                  <span>Gastos de envío</span>
                  <span>Gratis</span>
                </div>
                <div class="summary-total-cart">
                  <div class="final-price-cart">
                    <span>Precio final</span>
                    <span>{{ calcularTotal() }}€</span>
                  </div>
                </div>
              </div>
              <button class="btn-continue-cart" @click="continuarCompra">
                Continuar con la compra
              </button>
            </div>
          </div>
        </div>

        <div v-else class="my-cart">
          <div class="empty-cart">
            <div class="empty-cart-icon">
              <ShoppingCart :size="80" />
            </div>
            <h3>Tu carrito está vacío</h3>
            <button class="btn-keep-shopping-cart" @click="router.push('/')">
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>

    <Footer />

    <ConfirmModal :open="showConfirmModal" :onClose="closeConfirmModal" :onConfirm="handleConfirmEliminar"
      title="Eliminar del carrito"
      :message="productToDelete ? `¿Eliminar ${productToDelete.nombre} del carrito?` : ''" />
  </div>

</template>


<script setup>

  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-vue-next'
  import { useCart, deleteCart, changeQuantity, validateCartStock } from '../../api/useCart'
  import { useUserStore } from '../../stores/userStore'
  import { toast } from '../../stores/toastStore'
  import CartHeader from '../../components/CartHeader/CartHeader.vue'
  import Footer from '../../components/Footer/Footer.vue'
  import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.vue'
  import getImageUrl from '../../utils/getImage'
  import noDisponible from '../../assets/images/no-disponible.jpg'

  const router = useRouter()
  const userStore = useUserStore()
  const userId = computed(() => userStore.id)

  onMounted(() => {
    if (!userId.value) {
      router.push({ path: '/login', state: { from: '/carrito' } })
    }
  })

  const { cart, loading: cartLoading } = useCart(userId)

  const productosCarrito = ref([])
  const editingQuantity = ref({})
  const showConfirmModal = ref(false)
  const productToDelete = ref(null)

  watch(cart, (newCart) => {
    if (newCart && newCart.length > 0) {
      productosCarrito.value = newCart.map((item) => {
        const producto = item.producto || {}
        const plataforma = item.plataforma
        return {
          id: item.id,
          producto_id: item.producto_id,
          plataforma_id: item.plataforma_id ?? 0,
          plataformaNombre: plataforma?.nombre || null,
          nombre: producto.nombre || 'Producto',
          precio: parseFloat(producto.precio || 0),
          imagen: producto.imagen_url ? getImageUrl(producto.imagen_url) : '',
          cantidad: item.cantidad || 1
        }
      })
    } else {
      productosCarrito.value = []
    }
  }, { immediate: true })

  const getItemKey = (p) => `${p.producto_id}-${p.plataforma_id ?? 0}`

  const calcularTotal = () => {
    if (productosCarrito.value.length === 0) return '0.00'
    return productosCarrito.value
      .reduce((total, p) => total + p.precio * p.cantidad, 0)
      .toFixed(2)
  }

  const openConfirmModal = (producto) => {
    productToDelete.value = {
      productoId: producto.producto_id,
      plataformaId: producto.plataforma_id ?? 0,
      nombre: producto.nombre
    }
    showConfirmModal.value = true
  }

  const closeConfirmModal = () => {
    showConfirmModal.value = false
    productToDelete.value = null
  }

  const eliminarProducto = async (productoId, plataformaId = 0) => {
    if (!userId.value) return
    try {
      await deleteCart(userId.value, productoId, plataformaId)
      productosCarrito.value = productosCarrito.value.filter(
        p => !(p.producto_id === productoId && (p.plataforma_id ?? 0) === plataformaId)
      )
      const key = `${productoId}-${plataformaId}`
      delete editingQuantity.value[key]
      toast.success('Producto eliminado del carrito')
    } catch {
      toast.error('No se pudo eliminar del carrito')
    }
  }

  const handleConfirmEliminar = async () => {
    if (!productToDelete.value) return
    await eliminarProducto(productToDelete.value.productoId, productToDelete.value.plataformaId)
  }

  const setCantidad = async (productoId, newCantidad, plataformaId = 0) => {
    if (!userId.value || newCantidad < 1) return
    try {
      await changeQuantity(userId.value, productoId, newCantidad, plataformaId)
      productosCarrito.value = productosCarrito.value.map(p =>
        p.producto_id === productoId && (p.plataforma_id ?? 0) === plataformaId
          ? { ...p, cantidad: newCantidad }
          : p
      )
      delete editingQuantity.value[`${productoId}-${plataformaId}`]
    } catch (err) {
      toast.error(err.message || 'No se pudo actualizar la cantidad')
    }
  }

  const sumarProducto = async (producto) => {
    await setCantidad(producto.producto_id, producto.cantidad + 1, producto.plataforma_id ?? 0)
  }

  const restarProducto = (producto) => {
    if (producto.cantidad - 1 < 1) {
      openConfirmModal(producto)
      return
    }
    setCantidad(producto.producto_id, producto.cantidad - 1, producto.plataforma_id ?? 0)
  }

  const commitQuantityInput = (producto) => {
    const raw = editingQuantity.value[getItemKey(producto)]
    if (raw === undefined || raw === '') {
      delete editingQuantity.value[getItemKey(producto)]
      return
    }
    const num = parseInt(raw, 10)
    const newCantidad = Number.isNaN(num) ? producto.cantidad : Math.max(1, num)
    if (newCantidad < 1) {
      openConfirmModal(producto)
    } else {
      setCantidad(producto.producto_id, newCantidad, producto.plataforma_id ?? 0)
    }
  }

  const continuarCompra = async () => {
    if (!userId.value) return
    try {
      const { valido, errores } = await validateCartStock(userId.value)
      if (!valido && errores?.length > 0) {
        const primerError = errores[0]
        toast.error(`Stock insuficiente para ${primerError.nombre}. Disponible: ${primerError.stockDisponible}`)
        return
      }
      router.push('/envio')
    } catch (error) {
      toast.error(error.message || 'Error al validar el carrito')
    }
  }

</script>


<style scoped>

  .cart-page {
    background-image: url('../../assets/images/backgroundCart.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .cart-container {
    max-width: 1400px;
    width: 100%;
    margin: 60px auto 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 200px);
    box-sizing: border-box;
  }

  .cart-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .my-cart {
    background: rgba(91, 110, 245, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    min-width: 0;
  }

.my-cart h2 {
  color: white;
  font-size: 1.8rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.cart-products {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

  .product-item-cart {
    background: rgba(91, 110, 245, 0.4);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    min-width: 0;
  }

  .product-item-cart:hover {
    background: rgba(91, 110, 245, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .product-image-cart {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

.product-info-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

  .product-name-cart {
    color: white;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

.producto-plataforma-cart {
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

  .product-price-container-cart {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

.product-price-cart {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
}

.product-actions-cart {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon-cart {
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-cart:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.btn-add-cart:hover {
  color: #44b385;
}

.btn-minus-cart:hover {
  color: #fbbf24;
}

.btn-delete-cart:hover {
  color: #ef4444;
}

.product-quantity-cart {
  min-width: 32px;
  padding: 4px 8px;
  margin: 0 6px;
  text-align: center;
  background-color: #f3f3f3;
  border-radius: 6px;
  font-weight: 600;
}

  .product-quantity-input-cart {
    border: 1px solid rgba(255, 255, 255, 0.2);
    font: inherit;
    max-width: 3.5rem;
  }

  .product-quantity-input-cart::-webkit-outer-spin-button,
  .product-quantity-input-cart::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .product-quantity-input-cart[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  .cart-summary {
    background: rgba(91, 110, 245, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    height: fit-content;
    position: sticky;
    top: 2rem;
    min-width: 0;
  }

.cart-summary h2 {
  color: white;
  font-size: 1.8rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.summary-content-cart {
  display: flex;
  gap: 1.5rem;
  flex-direction: column;
}

.btn-continue-cart {
  background-color: #44b385;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(123, 199, 77, 0.3);
}

.btn-continue-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(123, 199, 77, 0.5);
}

.btn-continue-cart:active {
  transform: translateY(0);
}

.summary-detail-cart {
  background: rgba(91, 110, 245, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-detail-cart h3 {
  color: white;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

  .summary-line-cart {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
  }

.summary-line-cart span:last-child {
  font-weight: 600;
  color: white;
}

.summary-total-cart {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

  .final-price-cart {
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    margin-top: 0.5rem;
  }

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
}

  .empty-cart-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    display: flex;
    justify-content: center;
    align-items: center;
  }

.empty-cart h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

  .btn-keep-shopping-cart {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
  }

.btn-keep-shopping-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 1226px) {
  .cart-container {
    padding: 1.5rem;
  }

  .cart-content {
    gap: 1.5rem;
  }

  .my-cart,
  .cart-summary {
    padding: 1.75rem;
  }

  .product-item-cart {
    padding: 1.25rem;
    gap: 1.25rem;
  }
}

@media (max-width: 1150px) {
  .cart-content {
    gap: 1.25rem;
  }

  .my-cart,
  .cart-summary {
    padding: 1.5rem;
  }

  .product-name-cart {
    font-size: 1.2rem;
  }

  .product-image-cart {
    width: 90px;
    height: 90px;
  }
}

@media (max-width: 1098px) {
  .cart-container {
    padding: 1.25rem;
  }

  .cart-content {
    gap: 1rem;
  }

  .my-cart,
  .cart-summary {
    padding: 1.25rem;
  }

  .product-item-cart {
    padding: 1rem;
    gap: 1rem;
  }

  .product-name-cart {
    font-size: 1.1rem;
  }

  .product-image-cart {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {

  .my-cart,
  .cart-summary {
    padding: 1.5rem;
  }

  .product-item-cart {
    flex-direction: column;
    text-align: center;
  }

  .product-info-cart h3 { font-size: 20px; }
  .product-image-cart { width: 120px; height: 120px; }

  .product-image-cart {
    width: 120px;
    height: 120px;
  }

  .product-price-container-cart {
    flex-direction: column;
    gap: 1rem;
  }

  .product-name-cart {
    white-space: normal;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 1rem;
    min-height: auto;
    width: 100%;
  }

  .my-cart h2,
  .cart-summary h2 {
    font-size: 1.4rem;
  }

  .product-name-cart {
    font-size: 1rem;
  }

  .product-price-cart {
    font-size: 1.1rem;
  }

  .btn-continue-cart {
    font-size: 1rem;
    padding: 0.9rem 1.5rem;
  }
}

@media (max-width: 320px) {
  .cart-container {
    padding: 0.75rem;
    margin-top: 40px;
  }

  .my-cart,
  .cart-summary {
    padding: 1rem;
  }

  .my-cart h2,
  .cart-summary h2 {
    font-size: 1.2rem;
  }

  .product-item-cart {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .product-image-cart {
    width: 70px;
    height: 70px;
  }

  .product-name-cart {
    font-size: 0.9rem;
  }

  .btn-continue-cart {
    font-size: 0.95rem;
    padding: 0.8rem 1.2rem;
  }
}
</style>