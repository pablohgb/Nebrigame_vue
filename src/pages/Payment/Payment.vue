<template>

  <div class="page-wrapper">
    <div class="payment-page">
      <CartHeader :pasoActual="3" />

      <div class="payment-container">
        <div class="payment-content">
          <div class="payment-form-panel">
            <h2>Método de pago</h2>

            <p v-if="paymentLoading" class="no-methods-msg">
              Cargando métodos de pago...
            </p>
            <p
              v-else-if="payment.length === 0 && !isAddingMethod"
              class="no-methods-msg"
            >
              No tienes métodos de pago guardados.
            </p>

            <div
              v-for="method in payment"
              :key="method.id"
              :class="`payment-method-item ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`"
            >
              <div
                class="payment-method-info"
                @click="selectedPaymentMethod = method"
                role="button"
                tabindex="0"
                @keydown.enter="selectedPaymentMethod = method"
              >
                <h3>{{ method.tipo }}</h3>
                <p>{{ method.detalles }}</p>
              </div>
              <button
                type="button"
                class="btn-delete-method"
                @click.stop="handleDeleteMethod(method.id)"
              >
                Eliminar
              </button>
            </div>

            <div v-if="isAddingMethod" class="add-method-form">
              <h3>Nuevo método de pago</h3>

              <div class="form-group-payment">
                <label for="tipo">Tipo</label>
                <select id="tipo" v-model="newMethod.tipo">
                  <option value="tarjeta">Tarjeta de crédito / débito</option>
                  <option value="paypal">PayPal</option>
                  <option value="transferencia">Transferencia bancaria</option>
                </select>
              </div>

              <div class="form-group-payment">
                <label for="detalles">Detalles</label>
                <input
                  type="text"
                  id="detalles"
                  v-model="newMethod.detalles"
                  placeholder="**** **** **** 1234"
                />
              </div>

              <div class="add-method-actions">
                <button
                  type="button"
                  class="btn-save-method"
                  @click="handleAddMethod"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  class="btn-cancel-method"
                  @click="isAddingMethod = false"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <button
              v-if="!isAddingMethod"
              type="button"
              class="btn-add-method"
              @click="isAddingMethod = true"
            >
              + Añadir método de pago
            </button>
          </div>

          <div class="payment-summary">
            <h2>Resumen</h2>
            <div class="summary-content-payment">
              <div class="summary-detail-payment">
                <h3>Total productos</h3>
                <p v-if="cartLoading" style="color: rgba(255, 255, 255, 0.7)">
                  Cargando...
                </p>
                <template v-else>
                  <div
                    v-for="p in productosCarrito"
                    :key="p.id"
                    class="summary-line-payment"
                  >
                    <span>{{ p.nombre }} x{{ p.cantidad }}</span>
                    <span>{{ (p.precio * p.cantidad).toFixed(2) }}€</span>
                  </div>
                  <div class="summary-line-payment">
                    <span>Gastos de envío</span>
                    <span>Gratis</span>
                  </div>
                  <div class="summary-total-payment">
                    <div class="final-price-payment">
                      <span>Precio final</span>
                      <span>{{ calcularTotal() }}€</span>
                    </div>
                  </div>
                </template>
              </div>

              <div v-if="direccion" class="summary-address-payment">
                <h3>Dirección de envío</h3>
                <p>
                  {{ direccion.calle }}, {{ direccion.numeroCasa }}<br />
                  {{ direccion.codigoPostal }} {{ direccion.ciudad }}<br />
                  {{
                    direccion.region === "canarias"
                      ? "Islas Canarias"
                      : "Península y Baleares"
                  }}<br />
                  Tel: {{ direccion.telefono || direccion.telefonoContacto }}
                </p>
              </div>

              <button
                type="button"
                class="btn-pay"
                @click="confirmarPedido"
                :disabled="
                  !selectedPaymentMethod ||
                  processingOrder ||
                  productosCarrito.length === 0
                "
                :title="
                  !selectedPaymentMethod
                    ? 'Selecciona un método de pago'
                    : productosCarrito.length === 0
                      ? 'Tu carrito está vacío'
                      : ''
                "
              >
                {{ processingOrder ? "Procesando..." : "Confirmar pedido" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>

</template>


<script setup>

  import { ref, computed, watch } from "vue";
  import { useRouter } from "vue-router";
  import { useCart } from "../../api/useCart";
  import { usePayment, addPaymentMethod, deletePaymentMethod } from "../../api/usePayment";
  import { createOrder } from "../../api/useOrders";
  import { useUserStore } from "../../stores/userStore";
  import { toast } from "../../stores/toastStore";
  import { getNavigationHistoryState } from "../../utils/navigationState";
  import CartHeader from "../../components/CartHeader/CartHeader.vue";
  import Footer from "../../components/Footer/Footer.vue";

  const router = useRouter();
  const userStore = useUserStore();
  const userId = computed(() => userStore.id);

  const nav = getNavigationHistoryState();
  const direccion = nav.direccion ?? null;
  const total = nav.total ?? null;

  const { cart, loading: cartLoading } = useCart(userId);
  const { payment, loading: paymentLoading, refetchPayment } = usePayment(userId);

  const productosCarrito = ref([]);
  const selectedPaymentMethod = ref(null);
  const isAddingMethod = ref(false);
  const processingOrder = ref(false);
  const newMethod = ref({ tipo: "tarjeta", detalles: "" });

  watch(
    cart,
    (newCart) => {
      if (newCart && newCart.length > 0) {
        productosCarrito.value = newCart.map((item) => {
          const producto = item.producto || {};
          return {
            id: item.id,
            productoId: item.producto_id || producto.id,
            plataforma_id: item.plataforma_id ?? 0,
            nombre: producto.nombre || "Producto",
            precio: parseFloat(producto.precio || 0),
            cantidad: item.cantidad || 1,
          };
        });
      } else {
        productosCarrito.value = [];
      }
    },
    { immediate: true },
  );

  const calcularTotal = () => {
    if (total) return total;
    if (productosCarrito.value.length === 0) return "0.00";
    return productosCarrito.value
      .reduce((acc, p) => acc + p.precio * p.cantidad, 0)
      .toFixed(2);
  };

  const handleAddMethod = async () => {
    if (!newMethod.value.tipo || !newMethod.value.detalles.trim()) return;
    try {
      const data = await addPaymentMethod(
        userId.value,
        newMethod.value.tipo,
        newMethod.value.detalles.trim(),
      );
      newMethod.value = { tipo: "tarjeta", detalles: "" };
      isAddingMethod.value = false;
      refetchPayment();
      if (data?.metodoPago) selectedPaymentMethod.value = data.metodoPago;
      toast.success("Método de pago añadido");
    } catch {
      toast.error("Error al añadir método de pago");
    }
  };

  const handleDeleteMethod = async (metodoId) => {
    try {
      await deletePaymentMethod(userId.value, metodoId);
      if (selectedPaymentMethod.value?.id === metodoId)
        selectedPaymentMethod.value = null;
      refetchPayment();
      toast.success("Método de pago eliminado");
    } catch {
      toast.error("Error al eliminar método de pago");
    }
  };

  const confirmarPedido = async () => {
    if (productosCarrito.value.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    if (!selectedPaymentMethod.value) {
      toast.error("Selecciona un método de pago");
      return;
    }

    processingOrder.value = true;
    try {
      const orderData = {
        direccion_id: direccion?.id,
        telefono_contacto:
          direccion?.telefono || direccion?.telefonoContacto || "000000000",
        metodo_pago_id: selectedPaymentMethod.value.id,
        notas: "Notas del pedido",
      };
      await createOrder(userId.value, orderData);
      toast.success("¡Pedido realizado con éxito!");
      setTimeout(() => router.push("/pedidos"), 1000);
    } catch (error) {
      toast.error(
        error.message || "Error al procesar el pedido. Inténtalo de nuevo.",
      );
    } finally {
      processingOrder.value = false;
    }
  };

</script>


<style scoped>

  .payment-page {
    background-image: url("../../assets/images/backgroundCart.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 100vh;
  }

  .payment-container {
    max-width: 1400px;
    margin: 60px auto 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 200px);
  }

  .payment-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .payment-form-panel {
    background: rgba(91, 110, 245, 0.3);
    backdrop-filter: blur(2px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .payment-form-panel h2 {
    color: white;
    font-size: 1.8rem;
    margin: 0;
    font-weight: 600;
  }

  .payment-method-item {
    background: rgba(91, 110, 245, 0.4);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: background 0.2s ease;
  }

  .payment-method-item:hover {
    background: rgba(91, 110, 245, 0.55);
  }

  .payment-method-item.selected {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(91, 110, 245, 0.6);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  .payment-method-info {
    flex: 1;
    cursor: pointer;
  }
  .payment-method-info h3 {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
  .payment-method-info p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin: 0;
  }

  .btn-delete-method {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .btn-delete-method:hover {
    background: rgba(239, 68, 68, 0.4);
    color: white;
  }

  .btn-add-method {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px dashed rgba(255, 255, 255, 0.3);
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    width: 100%;
    text-align: center;
  }

  .btn-add-method:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .add-method-form {
    background: rgba(91, 110, 245, 0.25);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .add-method-form h3 {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .form-group-payment {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-group-payment label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .form-group-payment input,
  .form-group-payment select {
    padding: 12px 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .form-group-payment input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  .form-group-payment select option {
    background: #3b4abf;
    color: white;
  }

  .form-group-payment input:focus,
  .form-group-payment select:focus {
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  .add-method-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-save-method {
    background-color: #44b385;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    flex: 1;
  }

  .btn-save-method:hover {
    background-color: #38a070;
    transform: translateY(-1px);
  }

  .btn-cancel-method {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn-cancel-method:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .payment-summary {
    background: rgba(91, 110, 245, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .payment-summary h2 {
    color: white;
    font-size: 1.8rem;
    margin: 0 0 1.5rem 0;
    font-weight: 600;
  }
  .summary-content-payment {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .summary-detail-payment {
    background: rgba(91, 110, 245, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-detail-payment h3 {
    color: white;
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }
  .summary-line-payment {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
  }
  .summary-line-payment span:last-child {
    font-weight: 600;
    color: white;
  }

  .summary-address-payment {
    background: rgba(91, 110, 245, 0.3);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-address-payment h3 {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.6rem 0;
  }
  .summary-address-payment p {
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.6;
  }
  .summary-total-payment {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
  }
  .final-price-payment {
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    margin-top: 0.5rem;
  }

  .btn-pay {
    background: linear-gradient(135deg, #44b385 0%, #2d9a6e 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(68, 179, 133, 0.3);
    font-family: inherit;
    width: 100%;
  }

  .btn-pay:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(68, 179, 133, 0.5);
  }
  .btn-pay:active {
    transform: translateY(0);
  }
  .btn-pay:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  .no-methods-msg {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
    font-style: italic;
  }

  @media (max-width: 1024px) {
    .payment-content {
      grid-template-columns: 1fr;
    }
    .payment-summary {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .payment-form-panel,
    .payment-summary {
      padding: 1.5rem;
    }
    .add-method-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .payment-container {
      padding: 1rem;
    }
    .payment-form-panel h2,
    .payment-summary h2 {
      font-size: 1.4rem;
    }
  }
  
</style>
