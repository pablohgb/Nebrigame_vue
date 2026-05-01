<template>
  
  <header class="header">
    <nav class="navbar">
      <RouterLink to="/" class="logo">
        <img src="/logo.png" alt="Logo NebriGame" />
      </RouterLink>

      <button type="button" class="menu-toggle" @click="toggleMenu">
        <X v-if="isMenuOpen" :size="28" />
        <Menu v-else :size="28" />
      </button>

      <ul :class="`nav-links ${isMenuOpen ? 'active' : ''}`">
        <li>
          <RouterLink to="/" :class="route.path === '/' ? 'active' : ''" @click="toggleMenu">Principal</RouterLink>
        </li>
        <li>
          <RouterLink to="/productos/videojuegos" :class="route.path.startsWith('/productos/videojuegos') ? 'active' : ''" @click="toggleMenu">
            <Gamepad2 :size="18" /> Juegos
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/productos/consolas" :class="route.path.startsWith('/productos/consolas') ? 'active' : ''" @click="toggleMenu">
            <Tv :size="18" /> Consolas
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/productos/merchandising" :class="route.path.startsWith('/productos/merchandising') ? 'active' : ''" @click="toggleMenu">
            <Gift :size="18" /> Merchandising
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/ofertas" :class="route.path === '/ofertas' ? 'active' : ''" @click="toggleMenu">
            <Percent :size="18" /> Ofertas
          </RouterLink>
        </li>

        <li class="search-item">
          <form ref="searchFormRef" @submit.prevent="handleSearch" :class="`header-search ${isSearchExpanded ? 'expanded' : ''}`">
            <button
              :type="isSearchExpanded && searchTerm ? 'submit' : 'button'"
              @click="isSearchExpanded && searchTerm ? undefined : toggleSearch()"
              class="header-search-btn"
            >
              <SearchIcon :size="20" />
            </button>
            <input
              ref="searchInputRef"
              type="text"
              placeholder="Buscar..."
              v-model="searchTerm"
              class="header-search-input"
            />
          </form>
        </li>
      </ul>

      <ul :class="`nav-links-right ${isMenuOpen ? 'active' : ''}`">
        <UsuarioDropdown />
        <li>
          <RouterLink to="/wishlist" :class="route.path === '/wishlist' ? 'active' : ''" @click="toggleMenu">
            <Heart :size="24" />
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/carrito" :class="route.path === '/carrito' ? 'active' : ''" @click="toggleMenu">
            <ShoppingCart :size="24" />
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>

</template>


<script setup>

  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Gamepad2, Tv, Gift, Percent, Heart, ShoppingCart, Menu, X, Search as SearchIcon } from 'lucide-vue-next'
  import UsuarioDropdown from '../UsuarioDropdown/UsuarioDropdown.vue'

  const props = defineProps({
    busqueda: { type: String, default: '' }
  })

  const emit = defineEmits(['update:busqueda'])

  const route = useRoute()
  const router = useRouter()
  const isMenuOpen = ref(false)
  const searchTerm = ref(props.busqueda)
  const isSearchExpanded = ref(false)
  const searchInputRef = ref(null)
  const searchFormRef = ref(null)

  watch(() => props.busqueda, (val) => {
    searchTerm.value = val
  })

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  const toggleSearch = () => {
    isSearchExpanded.value = !isSearchExpanded.value
    if (isSearchExpanded.value) {
      setTimeout(() => searchInputRef.value?.focus(), 100)
    } else if (searchTerm.value) {
      searchTerm.value = ''
      emit('update:busqueda', '')
    }
  }

  const handleSearch = () => {
    if (searchTerm.value.trim()) {
      emit('update:busqueda', searchTerm.value)
      router.push(`/productos?query=${encodeURIComponent(searchTerm.value)}`)
      isMenuOpen.value = false
    }
  }

  const handleClickOutside = (e) => {
    if (searchFormRef.value && !searchFormRef.value.contains(e.target)) {
      isSearchExpanded.value = false
    }
  }

  watch(isSearchExpanded, (val) => {
    if (val) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

</script>


<style scoped>

  .header {
    background-color: #4C71FF;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .logo img {
    width: 90px;
    height: auto;
  }

  .navbar {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0.8rem 0.8rem;
    margin: 0 20px 0 0;
    position: relative;
    max-width: 100%;
    box-sizing: border-box;
  }

  .nav-links {
    display: flex;
    list-style: none;
    gap: 0.5rem;
    margin-left: 40px;
    padding: 0;
  }

  .nav-links-right {
    display: flex;
    list-style: none;
    margin: 0;
    margin-left: auto;
    gap: 0.5rem;
    flex-shrink: 1;
    min-width: 0;
  }

  .nav-links a,
  .nav-links-right a {
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

  .nav-links a:hover,
  .nav-links-right a:hover,
  .nav-links a.active,
  .nav-links-right a.active {
    background-color: #7F30BC;
    color: #ffffff;
  }

  .header-search {
    display: flex;
    align-items: center;
    margin: 0 10px;
    position: relative;
  }

  .header-search-btn {
    padding: 8px 12px;
    background: linear-gradient(135deg, #7F30BC 0%, #6525A3 100%);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    min-width: 40px;
    min-height: 40px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .header-search-btn:hover {
    background: linear-gradient(135deg, #6525A3 0%, #541F8B 100%);
    transform: scale(1.05);
  }

  .header-search-btn:active {
    transform: scale(0.95);
  }

  .header-search-input {
    padding: 10px 14px 10px 50px;
    font-size: 14px;
    border: 2px solid #7F30BC;
    border-radius: 20px;
    background-color: rgba(127, 48, 188, 0.2);
    color: white;
    transition: all 0.4s ease;
    width: 0;
    opacity: 0;
    position: absolute;
    left: 0;
  }

  .header-search-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .header-search-input:focus {
    outline: none;
    background-color: rgba(127, 48, 188, 0.3);
  }

  .header-search.expanded .header-search-input {
    width: 200px;
    opacity: 1;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    color: #ecf0f1;
    cursor: pointer;
    padding: 0.4rem;
    margin-left: auto;
  }

  @media (max-width: 1226px) {
    .navbar { 
      margin: 0 10px 0 0; 
    }

    .nav-links { 
      gap: 0.4rem; 
      margin-left: 30px; 
    }

    .nav-links-right { 
      gap: 0.4rem; }

    .nav-links a { 
      padding: 0.5rem 1rem; 
      font-size: 0.9rem; 
    }

    .hola-usuario { 
      padding: 0.5rem 1rem; 
      font-size: 0.9rem; 
    }
  }

  @media (max-width: 1150px) {
    .navbar { 
      margin: 0 5px 0 0; 
    }
    
    .nav-links { 
      gap: 0.3rem; 
      margin-left: 20px; 
    }

    .nav-links-right { 
      gap: 0.3rem; 
    }

    .nav-links a { 
      padding: 0.4rem 0.8rem; 
      font-size: 0.85rem; 
    }

    .hola-usuario { 
      padding: 0.4rem 0.8rem; 
      font-size: 0.85rem; 
    }

    .header-search-btn { 
      min-width: 36px; 
      min-height: 36px; 
    }
  }

  @media (max-width: 1098px) {
    .navbar { 
      margin: 0; 
      padding: 0.8rem 0.5rem; 
    }

    .logo img { 
      width: 70px; 
    }

    .nav-links { 
      gap: 0.2rem; 
      margin-left: 15px; 
    }

    .nav-links-right { 
      gap: 0.2rem; 
    }

    .nav-links a { 
      padding: 0.4rem 0.6rem; 
      font-size: 0.8rem; gap: 0.3rem; 
    }

    .nav-links-right a { 
      padding: 0.5rem 0.8rem; 
    }

    .hola-usuario { 
      padding: 0.4rem 0.7rem; 
      font-size: 0.8rem; 
      gap: 0.3rem; 
    }

    .header-search { 
      margin: 0 5px; 
    }

    .header-search-btn { 
      min-width: 34px; 
      min-height: 34px; 
      padding: 6px 10px; 
    }
  }

  @media (max-width: 1024px) {
    .header-search.expanded .header-search-input { 
      width: 150px; 
    }
  }

  @media (max-width: 960px) {
    .menu-toggle { 
      display: block; 
    }

    .navbar { 
      flex-wrap: wrap; 
    }

    .nav-links { 
      display: none; 
      flex-direction: column; 
      width: 100%; 
    }

    .nav-links-right { 
      display: none; 
      flex-direction: row; 
      flex-wrap: wrap; 
      width: 100%; 
      padding-bottom: 10px; 
      margin: 30px 0 0 40px; 
      gap: 0.5rem; 
    }

    .header-search { 
      order: 3; 
      width: 100%; 
      margin: 10px 0 0 0;
      justify-content: flex-start; 
    }

    .header-search-input { 
      width: 200px !important; 
      opacity: 1 !important; 
    }

    .header-search-btn { 
      border-radius: 50%; 
    }

    .nav-links.active { 
      display: flex; 
    }

    .nav-links-right.active { 
      display: flex; 
      margin-left: 20px; 
    }

    .nav-links a { 
      width: auto; 
      justify-content: flex-start; 
      padding: 0.8rem 1rem; 
    }

    .nav-links-right a { 
      width: auto; 
    }

    .logo img { 
      width: 50px; 
    }

  }

  @media (max-width: 480px) {
    .navbar { 
      padding: 0.6rem 1rem; 
    }

    .logo img { width: 40px; 
    }

    .nav-links a { 
      font-size: 0.9rem; 
    }
  }

</style>