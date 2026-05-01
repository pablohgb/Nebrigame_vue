<template>
  
  <div class="page-wrapper">
    <div class="background">
      <Header />
      <div class="welcome">
        <section class="hero">
          <h1>Bienvenido a NebriGame</h1>
          <p>Tu tienda online de videojuegos, consolas y merchandising. <br />
            Encuentra todo lo que necesitas con un sólo click.
            Compra ahora o reserva los últimos lanzamientos.
          </p>
        </section>
      </div>
    </div>

    <div class="home-container">
      <section class="featured-section">
        <div class="section-name">
          <h2>Productos Destacados</h2>
        </div>
        <div class="productos-grid">
          <ProductCard
            v-for="producto in productosDestacados"
            :key="producto.id"
            :id="producto.id"
            :imagen="getImageUrl(producto.imagen_url)"
            :nombre="producto.nombre"
            :precio="producto.precio"
            :tipo="producto.tipo"
          />
        </div>
      </section>
    </div>
    <Footer />
  </div>

</template>


<script setup>

  import { computed } from 'vue'
  import { useVideojuegos, useConsolas, useMerchandising } from '../../api/useProduct'
  import Header from '../../components/Header/Header.vue'
  import Footer from '../../components/Footer/Footer.vue'
  import ProductCard from '../../components/ProductCard/ProductCard.vue'
  import getImageUrl from '../../utils/getImage'

  const { videojuegos } = useVideojuegos()
  const { consolas } = useConsolas()
  const { merchandising } = useMerchandising()

  const productosDestacadosIds = [1, 6, 13, 16, 17, 23]

  const productosDestacados = computed(() => {
    const todos = [
      ...videojuegos.value.map(v => ({ ...v, tipo: 'videojuegos' })),
      ...consolas.value.map(c => ({ ...c, tipo: 'consolas' })),
      ...merchandising.value.map(m => ({ ...m, tipo: 'merchandising' }))
    ]
    return todos.filter(p => productosDestacadosIds.includes(p.id))
  })

</script>

<style scoped>

  .welcome {
    padding-bottom: 3rem;
  }

  .background {
    background-image: url('../../assets/images/fondo_home.jpg');
    height: auto;
    width: auto;
  }

  .hero {
    color: rgb(255, 255, 255);
    padding: 4rem 2rem;
    margin-bottom: 3rem;
    text-align: left;
  }

  .home-container {
    flex: 1;
  }

  .section-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 1.4rem;
  }

  .featured-section h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }

  @media (max-width: 768px) {
    .background {
      height: 100%;
    }
  }

</style>