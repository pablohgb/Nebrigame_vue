<template>
  
  <header class="simple-header-cart">
    <nav class="navbar-cart">
      <RouterLink to="/" class="logo-cart">
        <img src="/logo.png" alt="Logo NebriGame" />
      </RouterLink>

      <div class="checkout-steps-cont">
        <ul class="checkout-steps-cart">
          <li v-for="(paso, index) in pasos" :key="paso.numero" :class="`step-cart ${pasoActual === paso.numero ? 'active' : ''} ${pasoActual > paso.numero ? 'completed' : ''}`" @click="handleStepClick(paso.numero)">
            <div class="step-number-cart">{{ paso.numero }}</div>
            <span>{{ paso.label }}</span>
            <span v-if="index < pasos.length - 1" class="step-line-cart" aria-hidden="true" />
          </li>
        </ul>
      </div>

      <button type="button" class="menu-toggle-cart" @click="toggleMenu">
        <X v-if="isMenuOpen" :size="28" />
        <Menu v-else :size="28" />
      </button>

      <ul :class="`nav-links-right-cart ${isMenuOpen ? 'active' : ''}`">
        <UsuarioDropdown />
        <li>
          <RouterLink to="/wishlist" :class="route.path === '/wishlist' ? 'active' : ''" @click="toggleMenu">
            <Heart :size="24" /><p class="text-menu-cart">Wishlist</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/carrito" :class="route.path === '/carrito' ? 'active' : ''" @click="toggleMenu">
            <ShoppingCart :size="24" /><p class="text-menu-cart">Carrito</p>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>

</template>


<script setup>

  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Heart, ShoppingCart, Menu, X } from 'lucide-vue-next'
  import UsuarioDropdown from '../UsuarioDropdown/UsuarioDropdown.vue'

  const props = defineProps({
    pasoActual: { type: Number, default: 1 }
  })

  const route = useRoute()
  const router = useRouter()
  const isMenuOpen = ref(false)

  const pasos = [
    { numero: 1, label: 'Carro' },
    { numero: 2, label: 'Envío' },
    { numero: 3, label: 'Pago' },
  ]

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  const handleStepClick = (numero) => {
    if (numero === props.pasoActual || numero > props.pasoActual) return
    if (numero === 1) router.push('/carrito')
    else if (numero === 2) router.push('/envio')
    else if (numero === 3) router.push('/pago')
  }

</script>


<style scoped>

  .simple-header-cart {
    background-color: #4c70ff;
  }

  .navbar-cart {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0.8rem 0.8rem;
    margin: 0 20px 0 0;
    position: relative;
    max-width: 100%;
    box-sizing: border-box;
  }

  .logo-cart {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    order: 1;
    flex-shrink: 0;
  }

  .logo-cart:hover {
    transform: scale(1.05);
  }

  .logo-cart img {
    width: 90px;
    height: auto;
  }

  .checkout-steps-cont {
    display: flex;
    justify-content: center;
    flex: 1;
    order: 2;
    flex-shrink: 1;
    min-width: 0;
  }

  .checkout-steps-cart {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 30px;
    color: white;
    flex-shrink: 1;
  }

  .step-cart {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .step-number-cart {
    background: white;
    color: #5b6ef5;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .step-cart.active .step-number-cart {
    background: #44b385;
    color: white;
  }

  .step-line-cart {
    width: 80px;
    height: 2px;
    background: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .menu-toggle-cart {
    display: none;
    background: none;
    border: none;
    color: #ecf0f1;
    cursor: pointer;
    padding: 0.4rem;
    order: 3;
    margin-left: auto;
  }

  .usuario-container {
    position: relative;
  }

  .hola-usuario {
    color: #ecf0f1;
    font-weight: 500;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 25px;
    transition: all 0.3s ease;
    background: none;
    border: none;
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .hola-usuario:hover {
    background-color: #7F30BC;
  }

  .nav-links-right-cart {
    display: flex;
    list-style: none;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    order: 4;
    flex-shrink: 1;
    min-width: 0;
  }

  .nav-links-right-cart a {
    color: #ecf0f1;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.6rem 1.2rem;
    border-radius: 25px;
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
    flex-shrink: 1;
    min-width: 0;
  }

  .nav-links-right-cart a:hover,
  .nav-links-right-cart a.active {
    background-color: #7F30BC;
    color: #ffffff;
  }

  .text-menu-cart {
    display: none;
    margin: 0;
  }

/* FIXME - Arreglar formato */

  @media (max-width: 1226px) {
    .navbar-cart { margin: 0 10px; }
    .checkout-steps-cart { gap: 20px; }
    .step-cart { gap: 0.4rem; font-size: 0.95rem; }
    .step-line-cart { width: 60px; }
    .nav-links-right-cart { gap: 0.4rem; }
    .nav-links-right-cart a { padding: 0.5rem 1rem; font-size: 0.9rem; }
    .hola-usuario { padding: 0.5rem 1rem; font-size: 0.9rem; }
  }

  @media (max-width: 1150px) {
    .navbar-cart { margin: 0 5px; }
    .logo-cart img { width: 75px; }
    .checkout-steps-cart { gap: 15px; }
    .step-cart { gap: 0.3rem; font-size: 0.9rem; }
    .step-number-cart { width: 26px; height: 26px; font-size: 0.85rem; }
    .step-line-cart { width: 50px; }
    .nav-links-right-cart { gap: 0.3rem; }
    .nav-links-right-cart a { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
    .hola-usuario { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
  }

  @media (max-width: 1098px) {
    .navbar-cart { margin: 0; padding: 0.8rem 0.5rem; }
    .logo-cart img { width: 70px; }
    .checkout-steps-cart { gap: 10px; }
    .step-cart { gap: 0.25rem; font-size: 0.85rem; }
    .step-number-cart { width: 24px; height: 24px; font-size: 0.8rem; }
    .step-line-cart { width: 40px; }
    .nav-links-right-cart { gap: 0.2rem; }
    .nav-links-right-cart a { padding: 0.4rem 0.6rem; font-size: 0.8rem; }
    .hola-usuario { padding: 0.4rem 0.7rem; font-size: 0.8rem; gap: 0.3rem; }
  }

  @media (max-width: 1024px) {
    .navbar-cart { gap: 1rem; }
  }

  @media (max-width: 768px) {
    .navbar-cart { flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .logo-cart { order: 1; }
    .menu-toggle-cart { order: 3; margin-left: auto; display: block; }
    .checkout-steps-cont { order: 2; width: 100%; justify-content: center; padding: 0.4rem 0; }
    .step-line-cart { display: none; }
    .checkout-steps-cart { gap: 1.2rem; }
    .nav-links-right-cart { display: none; order: 4; width: 100%; flex-direction: column; gap: 0.5rem; padding-bottom: 0.3rem; margin-left: 0; }
    .nav-links-right-cart.active { display: flex; }
    .text-menu-cart { display: block; }
    .nav-links-right-cart a { padding: 0.5rem 1rem; }
    .logo-cart img { width: 50px; }
  }

  @media (max-width: 480px) {
    .navbar-cart { padding: 0.6rem 1rem; }
    .logo-cart img { width: 40px; }
    .nav-links-right-cart a { font-size: 0.9rem; padding: 0.5rem 0.8rem; }
    .step-cart { font-size: 0.85rem; }
  }

  @media (max-width: 420px) {
    .checkout-steps-cont { display: none; }
  }

</style>