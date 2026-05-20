<template>

  <header class="simple-header">
    <nav class="navbar-sh">
      <RouterLink to="/" class="logo-sh">
        <img src="/logo.png" alt="Logo NebriGame" />
      </RouterLink>

      <button type="button" class="menu-toggle-sh" @click="toggleMenu">
        <X v-if="isMenuOpen" :size="28" />
        <Menu v-else :size="28" />
      </button>

      <ul :class="`nav-links-right-sh ${isMenuOpen ? 'active' : ''}`">
        <UsuarioDropdown />
        <li>
          <RouterLink to="/wishlist" :class="route.path === '/wishlist' ? 'active' : ''" @click="toggleMenu">
            <Heart :size="24" /><p class="text-menu-sh">Wishlist</p>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/carrito" :class="route.path === '/carrito' ? 'active' : ''" @click="toggleMenu">
            <ShoppingCart :size="24" /><p class="text-menu-sh">Carrito</p>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>

</template>


<script setup>

  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { Heart, ShoppingCart, Menu, X } from 'lucide-vue-next'
  import UsuarioDropdown from '../UsuarioDropdown/UsuarioDropdown.vue'

  const route = useRoute()
  const isMenuOpen = ref(false)

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.navbar-sh')) {
      isMenuOpen.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleClickOutside))
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

</script>


<style scoped>

  .simple-header {
    background-color: #4c71ff;
    z-index: 100;
  }

  .navbar-sh {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0.8rem 0.8rem;
    margin: 0 20px 0 0;
    position: relative;
  }

  .logo-sh {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .logo-sh:hover {
    transform: scale(1.05);
  }

  .logo-sh img {
    width: 90px;
    height: auto;
  }

  .nav-links-right-sh {
    display: flex;
    list-style: none;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    margin-left: auto;
  }

  .nav-links-right-sh a {
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
  }

  .nav-links-right-sh a:hover,
  .nav-links-right-sh a.active {
    background-color: #7F30BC;
    color: #ffffff;
  }

  .text-menu-sh {
    display: none;
  }

  .menu-toggle-sh {
    display: none;
    background: none;
    border: none;
    color: #ecf0f1;
    cursor: pointer;
    padding: 0.4rem;
  }

  @media (max-width: 1024px) {
    .navbar-sh {
      gap: 1rem;
    }

    .nav-links-right-sh {
      gap: 0.3rem;
    }

    .nav-links-right-sh a {
      padding: 0.5rem 0.8rem;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 768px) {
    .navbar-sh {
      flex-wrap: wrap;
      align-items: center;
    }

    .logo-sh {
      order: 1;
    }

    .menu-toggle-sh {
      display: block;
      margin-left: auto;
      order: 2;
    }

    .nav-links-right-sh {
      display: none;
      margin-left: 0;
    }

    .nav-links-right-sh.active {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 0.5rem;
      width: 100%;
      order: 3;
      margin-top: 0.8rem;
      padding-bottom: 0.3rem;
    }

    .text-menu-sh {
      display: block;
    }

    .nav-links-right-sh a {
      padding: 0.5rem 1rem;
    }

    .logo-sh img {
      width: 50px;
    }
  }

  @media (max-width: 480px) {
    .navbar-sh {
      padding: 0.6rem 1rem;
    }

    .logo-sh img {
      width: 40px;
    }

    .nav-links-right-sh a {
      font-size: 0.9rem;
      padding: 0.5rem 0.8rem;
    }
  }

</style>