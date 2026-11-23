<template>
  <div class="page-wrapper">
    <Header />

    <section class="about-seccion">
      <h1 class="about-titulo">Sobre Nosotros</h1>
      <p class="about-intro">
        Somos el equipo detrás de NebriGame, un proyecto educativo de tienda online
        de videojuegos, consolas y merchandising.
      </p>

      <div class="equipo-grid">
        <article v-for="miembro in equipo" :key="miembro.nombre" class="miembro-card">
          <img
            :src="miembro.imagen"
            :alt="`${miembro.nombre} ${miembro.apellidos}`"
            class="miembro-img"
          />
          <div class="miembro-info">
            <h2 class="miembro-nombre">{{ miembro.nombre }} {{ miembro.apellidos }}</h2>
            <p class="miembro-bio">{{ miembro.bio }}</p>
            <div class="miembro-links">
              <a
                :href="miembro.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="miembro-link"
                :aria-label="`LinkedIn de ${miembro.nombre}`"
              >
                <v-icon name="fa-linkedin" scale="1.1" />
                LinkedIn
              </a>
              <a
                :href="miembro.github"
                target="_blank"
                rel="noopener noreferrer"
                class="miembro-link"
                :aria-label="`GitHub de ${miembro.nombre}`"
              >
                <v-icon name="fa-github" scale="1.1" />
                GitHub
              </a>
            </div>
          </div>
        </article>
      </div>

      <p class="about-disclaimer">
        Proyecto educativo. No se realizan transacciones ni se generan pedidos reales.
      </p>
    </section>

    <Footer />
  </div>
</template>

<script setup>
  import Header from '../../components/Header/Header.vue'
  import Footer from '../../components/Footer/Footer.vue'
  import pabloImg from '../../assets/images/pablo.jpeg'
  import javiImg from '../../assets/images/javi.jpg'
  import sofiaImg from '../../assets/images/sofia.jpg'

  const equipo = [
    {
      nombre: 'Pablo',
      apellidos: 'Herrero González-Barros',
      bio: 'Soy un Técnico Superior en Desarrollo de Aplicaciones Web, con un máster de formación no reglada en Desarrollo Web y alto nivel de inglés. También he trabajado con distintas herramientas de administración. Me apasiona todo lo que tenga que ver con la tecnología y busco formas de aprender más cada día y aplicarlo a proyectos personales que tengo en curso.',
      linkedin: 'https://www.linkedin.com/in/pablo-herrero-gonzalez/',
      github: 'https://github.com/pablohgb',
      imagen: pabloImg,
    },
    {
      nombre: 'Javier',
      apellidos: 'Monzón Rosique',
      bio: 'Soy un Técnico Superior en Desarrollo de Aplicaciones Web y Grado en Sistemas Microinformáticos y Redes. Me encanta todo lo relacionado con la tecnología y en especial con la programación, busco formas de aprender cada día para aplicarlo en mis proyectos personales.',
      linkedin: 'https://www.linkedin.com/in/javiermonzonros/',
      github: 'https://github.com/JotaMoncho',
      imagen: javiImg,
    },
    {
      nombre: 'Sofía',
      apellidos: 'Lacal Rodríguez',
      bio: 'Técnica Superior de Desarrollo de Aplicaciones Web con alto nivel de inglés, entusiasta de la tecnología y con conocimiento de diferentes lenguajes de programación. Con experiencia laboral como enfermera de quirófano. Me encanta trabajar en equipo y buscar soluciones innovadoras. Tengo gran motivación por ampliar mis conocimientos tecnológicas y lenguajes, con el fin de seguir creciendo profesionalmente.',
      linkedin: 'https://www.linkedin.com/in/sof%C3%ADa-lacal-rodr%C3%ADguez',
      github: 'https://github.com/SofiaLacal',
      imagen: sofiaImg,
    },
  ]
</script>

<style scoped>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    background-image:
      linear-gradient(rgba(34, 33, 33, 0.562), rgba(34, 33, 33, 0.562)),
      url('../../assets/images/backgroundProductos.jpg');
    background-repeat: round;
    background-size: 400px 400px;
    min-height: 100vh;
    overflow-x: clip;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .about-seccion {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
  }

  .about-titulo {
    color: #ffffff;
    margin: 0 0 12px 0;
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
  }

  .about-intro {
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    max-width: 720px;
    margin: 0 auto 32px;
    line-height: 1.6;
    font-size: 1.05rem;
  }

  .equipo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .miembro-card {
    border-radius: 8px;
    overflow: hidden;
    background: #8153b3;
    box-shadow:
      2px 2px 4px rgb(68, 229, 218),
      6px 6px 8px rgb(24, 100, 155),
      10px 10px 8px rgb(140, 87, 201);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
  }

  .miembro-card:hover {
    transform: scale(1.02);
  }

  .miembro-img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    object-position: center top;
    display: block;
    background-color: white;
  }

  .miembro-info {
    padding: 20px 22px 24px;
    background: linear-gradient(to bottom, #7439b3, #65319c);
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  .miembro-nombre {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;
  }

  .miembro-bio {
    margin: 0;
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.95rem;
    line-height: 1.65;
    flex: 1;
  }

  .miembro-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
  }

  .miembro-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.2s, border-color 0.2s;
  }

  .miembro-link:hover {
    background: rgba(255, 255, 255, 0.28);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .about-disclaimer {
    margin: 40px 0 16px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.1rem;
    font-style: italic;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .equipo-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .equipo-grid {
      grid-template-columns: 1fr;
    }

    .about-titulo {
      font-size: 1.6rem;
    }
  }
</style>
