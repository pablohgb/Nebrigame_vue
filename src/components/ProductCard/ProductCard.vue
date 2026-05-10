<template>
  
  <RouterLink :to="`/producto/${tipo}/${id}`" :class="`product-card product-card--${tipo}`">
    <img
      :src="imagen || noDisponible"
      :alt="nombre"
      :class="`product-img ${isFallback ? 'product-img--fallback' : ''}`"
      @error="handleImageError"
    />
    <div class="product-info">
      <h3 class="product-name">{{ nombre }}</h3>
      <p class="product-price">
        {{ Number(precio).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }} €
      </p>
    </div>
  </RouterLink>

</template>


<script setup>

  import { ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import noDisponible from '../../assets/images/no-disponible.jpg'

  const props = defineProps({
    id: Number,
    imagen: String,
    nombre: String,
    precio: [Number, String],
    tipo: String
  })

  const isFallback = ref(false)

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = noDisponible
    isFallback.value = true
  }

</script>


<style scoped>

  .product-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
    background: #8153b3;
    box-shadow: 2px 2px 4px rgb(68, 229, 218), 6px 6px 8px rgb(24, 100, 155), 10px 10px 8px rgb(140, 87, 201);
    text-decoration: none;
    display: block;
  }

  .product-card:hover {
    transform: scale(1.03);
  }

  .product-img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    display: block;
    background-color: white;
  }

  .product-card--videojuegos .product-img {
    object-fit: cover;
  }

  .product-card--videojuegos .product-img--fallback {
    object-fit: contain;
  }

  .product-info {
    padding: 12px 16px;
    background: linear-gradient(to bottom, #7439b3, #65319c);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-name {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .product-price {
    margin: 0;
    font-size: 22px;
    font-weight: bold;
    color: #ffffff;
    margin-left: 16px;
    white-space: nowrap;
  }
  
</style>