<template>

  <div class="loading-pantalla" role="status" aria-label="Cargando contenido">
    <div class="loading-animacion" aria-hidden="true"></div>
    <p>CARGANDO...</p>
  </div>
  
</template>


<style scoped>

  .loading-pantalla {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
    gap: 20px;
  }

  .loading-pantalla p {
    color: white;
    font-size: 32px;
    font-weight: bold;
    margin: 0;
  }

  .loading-animacion {
    width: 60px;
    height: 60px;
    border: 6px solid rgba(76, 113, 255, 0.2);
    border-top-color: rgb(76, 113, 255);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

</style>