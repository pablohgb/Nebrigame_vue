<template>
  
  <footer class="footer">
    <p>&copy; {{ new Date().getFullYear() }} NebriGame. Todos los derechos reservados</p>

    <div class="social">
      <a v-for="red in redes" :key="red.label" :href="red.href" target="_blank" rel="noopener noreferrer" :aria-label="`Visitar ${red.label}`">
        <v-icon :name="red.icon" scale="1.2"></v-icon>
        <span>{{ red.label }}</span>
      </a>
    </div>
  </footer>

</template>


<script setup>

  const redes = [
    { href: 'https://discord.com/',       icon: 'fa-discord',   label: 'Discord'   },
    { href: 'https://www.reddit.com/',    icon: 'fa-reddit',    label: 'Reddit'    },
    { href: 'https://www.twitch.tv/',     icon: 'fa-twitch',    label: 'Twitch'    },
    { href: 'https://x.com/',             icon: 'fa-x-twitter', label: 'Twitter'   },
    { href: 'https://www.instagram.com/', icon: 'fa-instagram', label: 'Instagram' },
    { href: 'https://www.youtube.com/',   icon: 'fa-youtube',   label: 'Youtube'   },
  ]

</script>


<style scoped>

  .footer {
    background-color: #4C71FF;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    box-sizing: border-box;
  }

  .footer > p {
    color: #ecf0f1;
    margin: 0;
    font-weight: 500;
    font-size: 0.6rem;
  }

  .social {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .social a {
    color: #ecf0f1;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.6rem;
  }

  .social a:hover {
    background-color: #7F30BC;
    color: #ffffff;
  }

  @media (max-width: 920px) {
    .footer {
      flex-direction: column;
      gap: 0.6rem;
      text-align: center;
    }

    .footer > p {
      display: none;
    }

    .social {
      justify-content: center;
    }

    .social span {
      display: none;
    }
  }

</style>