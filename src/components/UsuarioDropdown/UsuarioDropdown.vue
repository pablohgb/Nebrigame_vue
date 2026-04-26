<template>
  
  <li class="usuario-container">
    <template v-if="userStore.nombre">
      <span :class="`hola-usuario ${isDropdownOpen ? 'active' : ''}`" @click="isDropdownOpen = !isDropdownOpen">
        <User :size="24" /> ¡Hola, {{ userStore.nombre }}!
      </span>
      <div v-if="isDropdownOpen" class="usuario-dropdown">
        <RouterLink to="/perfil" @click="isDropdownOpen = false">Mi cuenta</RouterLink>
        <RouterLink to="/pedidos" @click="isDropdownOpen = false">Mis pedidos</RouterLink>
        <button @click="handleLogout">Cerrar sesión</button>
      </div>
    </template>
    <template v-else>
      <RouterLink to="/login">
        <User :size="24" />
      </RouterLink>
    </template>
  </li>

</template>

<script setup>

  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { User } from 'lucide-vue-next'
  import { useUserStore } from '../../stores/userStore'
  import { toast } from '../../stores/toastStore'

  const userStore = useUserStore()
  const router = useRouter()
  const isDropdownOpen = ref(false)

  const handleLogout = () => {
    const nombre = userStore.nombre
    userStore.logout()
    toast.success(`Sesión cerrada, hasta luego ${nombre}`)
    isDropdownOpen.value = false
    router.push('/')
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest('.usuario-container')) {
      isDropdownOpen.value = false
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleClickOutside))
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

</script>


<style scoped>

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
    font-family: inherit;
    font-size: 0.95rem;
  }

  .hola-usuario:hover {
    background-color: #7F30BC;
  }

  .hola-usuario.active {
    background-color: #7F30BC;
  }

  .usuario-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background-color: #2c3e50;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    min-width: 180px;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .usuario-dropdown a,
  .usuario-dropdown button {
    padding: 12px 20px !important;
    color: #ecf0f1 !important;
    text-decoration: none !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    cursor: pointer !important;
    text-align: left !important;
    transition: background-color 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    white-space: nowrap !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .usuario-dropdown a:hover,
  .usuario-dropdown button:hover {
    background-color: #7F30BC !important;
  }

</style>