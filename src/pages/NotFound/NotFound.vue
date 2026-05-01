<template>

  <div class="not-found-background">
    <div class="not-found-container">
      <div class="not-found-content">
        <h2>{{ code }} - {{ title }}</h2>
        <p class="tipo-unown">ABCDEFGHIJKLMNÑOPQRSTUVWYZ</p>
        <p>{{ message }}</p>
        <button @click="router.push('/')">Home</button>
      </div>
    </div>
  </div>

</template>


<script setup>

  import { useRouter } from 'vue-router'

  const router = useRouter()

  const props = defineProps({
    code: { type: Number, default: 404 },
    title: { type: String, default: 'Page Not Found' },
    message: { type: String, default: '' }
  })

</script>


<style scoped>

  .not-found-background {
    background-image: url('../../assets/images/backgroundNotFound.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.8rem;
    max-width: 600px;
    margin-bottom: 80px;
  }

  .not-found-content {
    font-family: 'Teacher', sans-serif;
    color: aliceblue;
    font-size: 1.2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    margin-top: 40px;
  }

  .not-found-content h2 {
    font-family: 'Gameplay', sans-serif;
    font-size: 3.4rem;
    margin: 0 0 1rem 0;
  }

  .not-found-content button {
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    border: solid rgb(0, 0, 0);
    font-weight: bold;
    cursor: pointer;
    background-color: #7143bbd8;
    width: fit-content;
  }

  .tipo-unown {
    font-family: 'Unown';
    font-size: 1rem;
  }

  @font-face {
    font-family: 'Gameplay';
    src: url('../../assets/fonts/Gameplay.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'Unown';
    src: url('../../assets/fonts/unown.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'Teacher';
    src: url('../../assets/fonts/KGTeacherBrady.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

</style>