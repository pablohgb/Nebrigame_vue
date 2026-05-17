<template>
  <div class="page-wrapper">
    <div class="shipping-page">
      <CartHeader :pasoActual="2" />

      <div class="shipping-container">
        <div class="shipping-content">
          <div class="shipping-form-panel">
            <h2>Dirección de envío</h2>

            <p v-if="addressesLoading" class="no-addresses-msg">
              Cargando direcciones...
            </p>
            <p
              v-else-if="addresses.length === 0 && !isAddingAddress"
              class="no-addresses-msg"
            >
              No tienes direcciones guardadas.
            </p>

            <div
              v-for="addr in addresses"
              :key="addr.id"
              :class="`shipping-address-item ${selectedAddress?.id === addr.id ? 'selected' : ''}`"
            >
              <div
                class="shipping-address-info"
                @click="selectedAddress = addr"
                role="button"
                tabindex="0"
                @keydown.enter="selectedAddress = addr"
              >
                <p class="shipping-address-line">
                  {{ addr.calle }}, {{ addr.numeroCasa }}
                </p>
                <p class="shipping-address-line">
                  {{ addr.codigoPostal }} {{ addr.ciudad }}
                </p>
                <p class="shipping-address-line shipping-address-meta">
                  {{
                    addr.region === "canarias"
                      ? "Islas Canarias"
                      : "Península y Baleares"
                  }}
                  {{
                    addr.telefonoContacto
                      ? ` • +34 ${addr.telefonoContacto}`
                      : ""
                  }}
                </p>
              </div>
              <button
                type="button"
                class="btn-delete-address"
                @click.stop="handleDeleteAddress(addr.id)"
              >
                Eliminar
              </button>
            </div>

            <div v-if="isAddingAddress" class="add-address-form">
              <h3>Nueva dirección</h3>

              <div class="form-row-shipping">
                <div class="form-group-shipping">
                  <label for="new-region">Región</label>
                  <select id="new-region" v-model="newAddress.region">
                    <option value="peninsula">Península y Baleares</option>
                    <option value="canarias">Islas Canarias</option>
                  </select>
                </div>
                <div class="form-group-shipping">
                  <label for="new-ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="new-ciudad"
                    v-model="newAddress.ciudad"
                    placeholder="Madrid"
                    :class="errors.ciudad ? 'input-error' : ''"
                    @input="validateField('ciudad', newAddress.ciudad)"
                  />
                  <span v-if="errors.ciudad" class="field-error">{{
                    errors.ciudad
                  }}</span>
                </div>
              </div>

              <div class="form-row-shipping">
                <div class="form-group-shipping">
                  <label for="new-codigoPostal">Código postal</label>
                  <input
                    type="text"
                    id="new-codigoPostal"
                    v-model="newAddress.codigoPostal"
                    placeholder="28001"
                    maxlength="5"
                    :class="errors.codigoPostal ? 'input-error' : ''"
                    @input="
                      validateField('codigoPostal', newAddress.codigoPostal)
                    "
                  />
                  <span v-if="errors.codigoPostal" class="field-error">{{
                    errors.codigoPostal
                  }}</span>
                </div>
                <div class="form-group-shipping">
                  <label for="new-telefono">Nº de contacto</label>
                  <div class="input-prefix-wrapper">
                    <span class="input-prefix">+34</span>
                    <input
                      type="tel"
                      id="new-telefono"
                      v-model="newAddress.telefono"
                      placeholder="600123456"
                      maxlength="9"
                      :class="errors.telefono ? 'input-error' : ''"
                      @input="validateField('telefono', newAddress.telefono)"
                    />
                  </div>
                  <span v-if="errors.telefono" class="field-error">{{
                    errors.telefono
                  }}</span>
                </div>
              </div>

              <div class="form-row-shipping">
                <div class="form-group-shipping">
                  <label for="new-calle">Calle</label>
                  <input
                    type="text"
                    id="new-calle"
                    v-model="newAddress.calle"
                    placeholder="Calle Gran Vía"
                    :class="errors.calle ? 'input-error' : ''"
                    @input="validateField('calle', newAddress.calle)"
                  />
                  <span v-if="errors.calle" class="field-error">{{
                    errors.calle
                  }}</span>
                </div>
                <div class="form-group-shipping short">
                  <label for="new-numeroCasa">Número</label>
                  <input
                    type="text"
                    id="new-numeroCasa"
                    v-model="newAddress.numeroCasa"
                    placeholder="12B"
                    :class="errors.numeroCasa ? 'input-error' : ''"
                    @input="validateField('numeroCasa', newAddress.numeroCasa)"
                  />
                  <span v-if="errors.numeroCasa" class="field-error">{{
                    errors.numeroCasa
                  }}</span>
                </div>
              </div>

              <div class="add-address-actions">
                <button
                  type="button"
                  class="btn-save-address"
                  @click="handleAddAddress"
                >
                  Guardar dirección
                </button>
                <button
                  type="button"
                  class="btn-cancel-address"
                  @click="cancelarNuevaDireccion"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <button
              v-if="!isAddingAddress"
              type="button"
              class="btn-add-address"
              @click="isAddingAddress = true"
            >
              + Añadir dirección
            </button>
          </div>

          <div class="shipping-summary">
            <h2>Resumen</h2>
            <div class="summary-content-shipping">
              <div class="summary-detail-shipping">
                <h3>Total productos</h3>
                <p v-if="cartLoading" style="color: rgba(255, 255, 255, 0.7)">
                  Cargando...
                </p>
                <template v-else>
                  <div
                    v-for="p in productosCarrito"
                    :key="p.id"
                    class="summary-line-shipping"
                  >
                    <span>{{ p.nombre }} x{{ p.cantidad }}</span>
                    <span>{{ (p.precio * p.cantidad).toFixed(2) }}€</span>
                  </div>
                  <div class="summary-line-shipping">
                    <span>Gastos de envío</span>
                    <span>Gratis</span>
                  </div>
                  <div class="summary-total-shipping">
                    <div class="final-price-shipping">
                      <span>Precio final</span>
                      <span>{{ calcularTotal() }}€</span>
                    </div>
                  </div>
                </template>
              </div>
              <button
                type="button"
                class="btn-continue-shipping"
                @click="handleContinue"
                :disabled="!canContinue"
                :title="
                  !canContinue
                    ? 'Selecciona una dirección o añade una nueva'
                    : ''
                "
              >
                Continuar al pago
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
  import { useCart, validateCartStock } from "../../api/useCart";
  import {
    useAddresses,
    addAddress,
    deleteAddress,
  } from "../../api/useAddresses";
  import { useUserStore } from "../../stores/userStore";
  import { toast } from "../../stores/toastStore";
  import CartHeader from "../../components/CartHeader/CartHeader.vue";
  import Footer from "../../components/Footer/Footer.vue";

  const router = useRouter();
  const userStore = useUserStore();
  const userId = computed(() => userStore.id);

  const { cart, loading: cartLoading } = useCart(userId);
  const {
    addresses,
    loading: addressesLoading,
    refetchAddresses,
  } = useAddresses(userId);

  const productosCarrito = ref([]);
  const isAddingAddress = ref(false);
  const selectedAddress = ref(null);
  const errors = ref({});

  const newAddress = ref({
    region: "peninsula",
    ciudad: "",
    codigoPostal: "",
    calle: "",
    numeroCasa: "",
    telefono: "",
  });

  watch(
    cart,
    (newCart) => {
      if (newCart && newCart.length > 0) {
        productosCarrito.value = newCart.map((item) => {
          const producto = item.producto || {};
          return {
            id: item.id,
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
    if (productosCarrito.value.length === 0) return "0.00";
    return productosCarrito.value
      .reduce((total, p) => total + p.precio * p.cantidad, 0)
      .toFixed(2);
  };

  const validar = (name, value) => {
    switch (name) {
      case "ciudad":
        return value.trim() === ""
          ? "Este campo es obligatorio"
          : /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)
            ? ""
            : "Solo se permiten letras";
      case "calle":
        return value.trim() === ""
          ? "Este campo es obligatorio"
          : /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,.\-/]+$/.test(value)
            ? ""
            : "No se permiten caracteres especiales";
      case "codigoPostal":
        return /^[0-9]{5}$/.test(value)
          ? ""
          : "Debe tener exactamente 5 dígitos numéricos";
      case "numeroCasa":
        return value.trim() === ""
          ? "Este campo es obligatorio"
          : /^[0-9a-zA-Z\-/]+$/.test(value)
            ? ""
            : "Solo números y letras (ej: 12, 4B)";
      case "telefono":
        return /^[0-9]{9}$/.test(value) ? "" : "Debe tener exactamente 9 dígitos";
      default:
        return "";
    }
  };

  const validateField = (name, value) => {
    errors.value[name] = validar(name, value);
  };

  const validateAll = () => {
    const campos = ["ciudad", "codigoPostal", "calle", "numeroCasa", "telefono"];
    const newErrors = {};
    campos.forEach((campo) => {
      const err = validar(campo, newAddress.value[campo]);
      if (err) newErrors[campo] = err;
    });
    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const canContinue = computed(() => {
    if (selectedAddress.value) return !!selectedAddress.value.telefonoContacto;
    if (isAddingAddress.value) {
      const campos = [
        "ciudad",
        "codigoPostal",
        "calle",
        "numeroCasa",
        "telefono",
      ];
      return campos.every((c) => validar(c, newAddress.value[c]) === "");
    }
    return false;
  });

  const cancelarNuevaDireccion = () => {
    isAddingAddress.value = false;
    newAddress.value = {
      region: "peninsula",
      ciudad: "",
      codigoPostal: "",
      calle: "",
      numeroCasa: "",
      telefono: "",
    };
    errors.value = {};
  };

  const handleAddAddress = async () => {
    if (!validateAll()) return;
    try {
      await addAddress(userId.value, { ...newAddress.value });
      cancelarNuevaDireccion();
      refetchAddresses();
    } catch (error) {
      console.error("Error añadiendo dirección:", error);
    }
  };

  const handleDeleteAddress = async (direccionId) => {
    try {
      await deleteAddress(userId.value, direccionId);
      if (selectedAddress.value?.id === direccionId) selectedAddress.value = null;
      refetchAddresses();
    } catch (error) {
      console.error("Error eliminando dirección:", error);
    }
  };

  const navigateToPayment = (direccionCompleta) => {
    router.push({
      path: "/pago",
      state: { direccion: direccionCompleta, total: calcularTotal() },
    });
  };

  const handleContinue = async () => {
    if (!userId.value) return;

    if (selectedAddress.value) {
      try {
        const { valido, errores } = await validateCartStock(userId.value);
        if (!valido && errores?.length > 0) {
          toast.error(
            `Stock insuficiente para ${errores[0].nombre}. Disponible: ${errores[0].stockDisponible}`,
          );
          return;
        }
        navigateToPayment({
          ...selectedAddress.value,
          telefono: selectedAddress.value.telefonoContacto,
        });
      } catch (error) {
        toast.error(error.message || "Error al validar el carrito");
      }
    } else if (isAddingAddress.value) {
      handleSelectNewAddressAndContinue();
    }
  };

</script>


<style scoped>
  .shipping-page {
    background-image: url("../../assets/images/backgroundCart.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 100vh;
  }

  .shipping-container {
    max-width: 1400px;
    margin: 60px auto 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 200px);
  }

  .shipping-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .shipping-form-panel {
    background: rgba(91, 110, 245, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .shipping-form-panel h2 {
    color: white;
    font-size: 1.8rem;
    margin: 0 0 1.5rem 0;
    font-weight: 600;
  }

  .no-addresses-msg {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    margin: 0;
  }

  .shipping-address-item {
    background: rgba(91, 110, 245, 0.4);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: background 0.2s ease;
    cursor: pointer;
  }

  .shipping-address-item:hover {
    background: rgba(91, 110, 245, 0.55);
  }

  .shipping-address-item.selected {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(91, 110, 245, 0.6);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  .shipping-address-info {
    flex: 1;
  }

  .shipping-address-line {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    margin: 0 0 4px 0;
  }

  .shipping-address-line:last-child {
    margin-bottom: 0;
    color: rgba(255, 255, 255, 0.7);
  }

  .btn-delete-address {
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

  .btn-delete-address:hover {
    background: rgba(239, 68, 68, 0.4);
    color: white;
  }

  .btn-add-address {
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

  .btn-add-address:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .add-address-form {
    background: rgba(91, 110, 245, 0.25);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .add-address-form h3 {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .add-address-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-save-address {
    background-color: #44b385;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-save-address:hover {
    background-color: #3da378;
  }

  .btn-continue-new-address:hover {
    background-color: #4a5ce4;
  }

  .btn-cancel-address {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-cancel-address:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .form-group-shipping {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group-shipping label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .form-group-shipping input,
  .form-group-shipping select {
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
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .form-group-shipping input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .form-group-shipping select option {
    background: #3b4abf;
    color: white;
  }

  .form-group-shipping input:focus,
  .form-group-shipping select:focus {
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  .form-row-shipping {
    display: flex;
    gap: 12px;
  }

  .form-row-shipping .form-group-shipping {
    flex: 1;
  }

  .form-row-shipping .form-group-shipping.short {
    flex: 0 0 140px;
  }

  .field-error {
    color: #fca5a5;
    font-size: 0.78rem;
    margin-top: 2px;
  }

  .form-group-shipping input.input-error,
  .form-group-shipping select.input-error {
    border-color: #f87171;
  }

  .shipping-summary {
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

  .shipping-summary h2 {
    color: white;
    font-size: 1.8rem;
    margin: 0 0 1.5rem 0;
    font-weight: 600;
  }

  .summary-content-shipping {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .summary-detail-shipping {
    background: rgba(91, 110, 245, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-detail-shipping h3 {
    color: white;
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  .summary-line-shipping {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
  }

  .summary-line-shipping span:last-child {
    font-weight: 600;
    color: white;
  }

  .summary-total-shipping {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
  }

  .final-price-shipping {
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    margin-top: 0.5rem;
  }

  .btn-continue-shipping {
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
    box-shadow: 0 4px 12px rgba(68, 179, 133, 0.3);
    font-family: inherit;
    width: 100%;
  }

  .btn-continue-shipping:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(68, 179, 133, 0.5);
  }

  .btn-continue-shipping:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-continue-shipping:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-prefix-wrapper {
    display: flex;
    align-items: stretch;
  }

  .input-prefix {
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    user-select: none;
    white-space: nowrap;
  }

  .input-prefix-wrapper input {
    border-radius: 0 8px 8px 0 !important;
  }

  @media (max-width: 1024px) {
    .shipping-content {
      grid-template-columns: 1fr;
    }

    .shipping-summary {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .shipping-form-panel,
    .shipping-summary {
      padding: 1.5rem;
    }

    .form-row-shipping {
      flex-direction: column;
    }

    .form-row-shipping .form-group-shipping.short {
      flex: 1;
    }
  }

  @media (max-width: 480px) {
    .shipping-container {
      padding: 1rem;
    }

    .shipping-form-panel h2,
    .shipping-summary h2 {
      font-size: 1.4rem;
    }
  }
</style>
