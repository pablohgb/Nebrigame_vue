<template>
  <div class="page-wrapper">
    <div class="background-profile">
      <Header />
      <div class="perfil-container">

        <div class="perfil-tabs">
          <button :class="`perfil-tab ${tabActiva === 'info' ? 'activa' : ''}`" @click="tabActiva = 'info'">
            Mi cuenta
          </button>
          <button :class="`perfil-tab ${tabActiva === 'ajustes' ? 'activa' : ''}`" @click="tabActiva = 'ajustes'">
            Ajustes
          </button>
        </div>

        <div class="perfil-contenido">
          <template v-if="tabActiva === 'info'">
            <div class="perfil-seccion">
              <div class="perfil-seccion-header">
                <h2>Datos personales</h2>
                <button class="perfil-btn-editar" @click="abrirModal('info')">Editar</button>
              </div>
              <div class="perfil-detalles">
                <div class="perfil-detalle">
                  <span class="perfil-label">Nombre</span>
                  <span class="perfil-valor">{{ userStore.nombre || '-' }}</span>
                </div>
                <div class="perfil-detalle">
                  <span class="perfil-label">Primer apellido</span>
                  <span class="perfil-valor">{{ userStore.apellido1 || '-' }}</span>
                </div>
                <div class="perfil-detalle">
                  <span class="perfil-label">Segundo apellido</span>
                  <span class="perfil-valor">{{ userStore.apellido2 || '-' }}</span>
                </div>
                <div class="perfil-detalle">
                  <span class="perfil-label">Email</span>
                  <span class="perfil-valor">{{ userStore.email || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="perfil-seccion">
              <div class="perfil-seccion-header">
                <h2>Contraseña</h2>
                <button class="perfil-btn-editar" @click="abrirModal('password')">Cambiar</button>
              </div>
              <div class="perfil-detalles">
                <div class="perfil-detalle">
                  <span class="perfil-label">Contraseña</span>
                  <span class="perfil-valor">••••••••</span>
                </div>
              </div>
            </div>
          </template>

          <template v-if="tabActiva === 'ajustes'">
            <div class="perfil-seccion">
              <h2>Ajustes de la cuenta</h2>
              <div class="ajustes-grupo">
                <div class="ajuste-item">
                  <div class="ajuste-info">
                    <h3>Notificaciones por email</h3>
                    <p>Recibe actualizaciones sobre tus pedidos y ofertas</p>
                  </div>
                  <label class="ajuste-switch">
                    <input type="checkbox" checked />
                    <span class="ajuste-slider"></span>
                  </label>
                </div>
                <div class="ajuste-item">
                  <div class="ajuste-info">
                    <h3>Newsletter</h3>
                    <p>Mantente al día con las últimas novedades</p>
                  </div>
                  <label class="ajuste-switch">
                    <input type="checkbox" />
                    <span class="ajuste-slider"></span>
                  </label>
                </div>
                <div class="ajuste-item">
                  <div class="ajuste-info">
                    <h3>Notificaciones de ofertas</h3>
                    <p>Recibe alertas de descuentos y promociones</p>
                  </div>
                  <label class="ajuste-switch">
                    <input type="checkbox" checked />
                    <span class="ajuste-slider"></span>
                  </label>
                </div>
              </div>

              <div class="ajustes-separador"></div>

              <div class="ajustes-subgrupo">
                <h3 class="ajustes-subtitulo">Zona de peligro</h3>
                <button class="perfil-btn-peligro" @click="abrirModalEliminar">Eliminar mi cuenta</button>
                <p class="ajustes-advertencia">Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Modal eliminar cuenta -->
      <div v-if="deleteModalStep > 0" class="modal-overlay modal-delete-overlay" @click="cerrarModalEliminar">
        <div :class="`modal-delete modal-delete--${DELETE_MODALS[deleteModalStep - 1].pos}`" @click.stop>
          <p class="modal-delete-msg">{{ DELETE_MODALS[deleteModalStep - 1].msg }}</p>
          <div class="modal-delete-actions">
            <button class="modal-delete-btn modal-delete-btn--cancel" @click="cerrarModalEliminar">No, mejor no</button>
            <button class="modal-delete-btn modal-delete-btn--confirm" @click="confirmarEliminar" :disabled="deletingAccount">
              {{ deletingAccount ? 'Eliminando...' : deleteModalStep === 4 ? 'Sí, eliminar' : 'Sí, continuar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal editar -->
      <div v-if="modalAbierto" class="modal-overlay" @click="cerrarModal">
        <div class="modal-contenido" @click.stop>
          <div class="modal-header">
            <h2>{{ tipoModal === 'info' ? 'Editar datos personales' : 'Cambiar contraseña' }}</h2>
            <button class="modal-cerrar" @click="cerrarModal"><X :size="24" /></button>
          </div>

          <form v-if="tipoModal === 'info'" @submit.prevent="handleGuardarInfo" class="perfil-form">
            <div class="perfil-campo">
              <label>Nombre</label>
              <input type="text" v-model="formInfo.nombre" />
            </div>
            <div class="perfil-campo">
              <label>Primer apellido</label>
              <input type="text" v-model="formInfo.apellido1" />
            </div>
            <div class="perfil-campo">
              <label>Segundo apellido</label>
              <input type="text" v-model="formInfo.apellido2" />
            </div>
            <div class="perfil-campo">
              <label>Email</label>
              <input type="email" v-model="formInfo.email" />
            </div>
            <p v-if="mensajeInfo" class="perfil-exito">{{ mensajeInfo }}</p>
            <p v-if="errorInfo" class="perfil-error">{{ errorInfo }}</p>
            <button type="submit" class="perfil-btn" :disabled="loadingInfo">
              {{ loadingInfo ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </form>

          <form v-if="tipoModal === 'password'" @submit.prevent="handleGuardarPass" class="perfil-form">
            <div class="perfil-campo">
              <label>Contraseña actual</label>
              <input type="password" v-model="formPass.contrasennaActual" placeholder="Escribe tu contraseña actual" />
            </div>
            <div class="perfil-campo">
              <label>Nueva contraseña</label>
              <input type="password" v-model="formPass.contrasennaNueva" placeholder="Escribe tu nueva contraseña" />
            </div>
            <div class="perfil-campo">
              <label>Confirmar nueva contraseña</label>
              <input type="password" v-model="formPass.confirmar" placeholder="Repite la nueva contraseña" />
            </div>
            <p v-if="mensajePass" class="perfil-exito">{{ mensajePass }}</p>
            <p v-if="errorPass" class="perfil-error">{{ errorPass }}</p>
            <button type="submit" class="perfil-btn" :disabled="loadingPass">
              {{ loadingPass ? 'Guardando...' : 'Cambiar contraseña' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>


<script setup>

  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { X } from 'lucide-vue-next'
  import { useUserStore } from '../../stores/userStore'
  import { updateProfile, deleteProfile } from '../../api/useAuth'
  import { toast } from '../../stores/toastStore'
  import Header from '../../components/Header/Header.vue'
  import Footer from '../../components/Footer/Footer.vue'

  const router = useRouter()
  const userStore = useUserStore()

  const DELETE_MODALS = [
    { msg: '¿Eliminar tu cuenta? Esta acción no se puede deshacer.', pos: 'top-left' },
    { msg: '¿Estás SEGURO? Todos tus pedidos, wishlist y datos... ¡desaparecerán para siempre!', pos: 'top-right' },
    { msg: 'Los juegos de tu biblioteca te llorarán. Las ranas del carrito también. ¿Continuar?', pos: 'bottom-right' },
    { msg: 'Ya está. Que la fuerza te acompañe... en otra cuenta. Adiós. 👋', pos: 'bottom-left' },
  ]

  const tabActiva = ref('info')
  const modalAbierto = ref(false)
  const tipoModal = ref('')
  const deleteModalStep = ref(0)
  const deletingAccount = ref(false)

  const formInfo = reactive({
    nombre: userStore.nombre,
    apellido1: userStore.apellido1,
    apellido2: userStore.apellido2,
    email: userStore.email
  })

  const loadingInfo = ref(false)
  const mensajeInfo = ref(null)
  const errorInfo = ref(null)

  const formPass = reactive({ contrasennaActual: '', contrasennaNueva: '', confirmar: '' })
  const loadingPass = ref(false)
  const mensajePass = ref(null)
  const errorPass = ref(null)

  const abrirModal = (tipo) => {
    tipoModal.value = tipo
    modalAbierto.value = true
    mensajeInfo.value = null
    errorInfo.value = null
    mensajePass.value = null
    errorPass.value = null
  }

  const cerrarModal = () => {
    modalAbierto.value = false
    tipoModal.value = ''
  }

  const abrirModalEliminar = () => { deleteModalStep.value = 1 }
  const cerrarModalEliminar = () => { deleteModalStep.value = 0 }

  const confirmarEliminar = () => {
    if (deleteModalStep.value < 4) {
      deleteModalStep.value++
    } else {
      ejecutarEliminacion()
    }
  }

  const ejecutarEliminacion = async () => {
    const userId = userStore.id != null && !isNaN(Number(userStore.id)) ? Number(userStore.id) : null
    if (!userId) {
      toast.error('No se pudo identificar tu cuenta. Intenta cerrar sesión y volver a iniciar.')
      deleteModalStep.value = 0
      return
    }

    deletingAccount.value = true
    try {
      await deleteProfile(userId)
      userStore.logout()
      toast.success('Cuenta eliminada')
      router.replace('/')
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la cuenta')
      deleteModalStep.value = 0
    } finally {
      deletingAccount.value = false
    }
  }

  const handleGuardarInfo = async () => {
    loadingInfo.value = true
    mensajeInfo.value = null
    errorInfo.value = null

    try {
      if (
        formInfo.nombre === userStore.nombre &&
        formInfo.apellido1 === userStore.apellido1 &&
        formInfo.apellido2 === userStore.apellido2 &&
        formInfo.email === userStore.email
      ) {
        errorInfo.value = 'No hay cambios para guardar'
      } else if (!formInfo.nombre) {
        errorInfo.value = 'El nombre no puede estar vacío'
      } else if (!formInfo.apellido1) {
        errorInfo.value = 'El primer apellido no puede estar vacío'
      } else if (!formInfo.email) {
        errorInfo.value = 'El email no puede estar vacío'
      } else {
        await updateProfile(userStore.id, {
          nombre: formInfo.nombre,
          apellido1: formInfo.apellido1,
          apellido2: formInfo.apellido2,
          email: formInfo.email
        })
        userStore.setUsuario(
          userStore.id,
          formInfo.nombre,
          formInfo.apellido1,
          formInfo.apellido2,
          formInfo.email,
          userStore.fecha_registro
        )
        mensajeInfo.value = 'Datos actualizados correctamente'
        setTimeout(() => cerrarModal(), 1500)
      }
    } catch (err) {
      errorInfo.value = err.message || 'Error al actualizar los datos'
    } finally {
      loadingInfo.value = false
    }
  }

  const handleGuardarPass = async () => {
    mensajePass.value = null
    errorPass.value = null

    if (formPass.contrasennaNueva !== formPass.confirmar) {
      errorPass.value = 'Las contraseñas nuevas no coinciden'
      return
    } else if (!formPass.contrasennaNueva) {
      errorPass.value = 'La contraseña nueva no puede estar vacía'
      return
    } else if (!formPass.contrasennaActual) {
      errorPass.value = 'La contraseña actual no puede estar vacía'
      return
    } else if (formPass.contrasennaNueva === formPass.contrasennaActual) {
      errorPass.value = 'La contraseña nueva no puede ser igual a la actual'
      return
    }

    loadingPass.value = true
    try {
      await updateProfile(userStore.id, {
        contrasenna: formPass.contrasennaNueva,
        contrasennaActual: formPass.contrasennaActual
      })
      mensajePass.value = 'Contraseña actualizada correctamente'
      formPass.contrasennaActual = ''
      formPass.contrasennaNueva = ''
      formPass.confirmar = ''
      setTimeout(() => cerrarModal(), 1500)
    } catch (err) {
      errorPass.value = err.message || 'Error al actualizar la contraseña'
    } finally {
      loadingPass.value = false
    }
  }
</script>


<style scoped>

  .background-profile {
    background-image: url('../../assets/images/perfilBackground.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
  }

  .perfil-container {
    max-width: 1000px;
    margin: 40px auto 0;
    display: flex;
    gap: 30px;
  }

  .perfil-tabs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 180px;
    position: sticky;
    top: 20px;
  }

  .perfil-tab {
    padding: 12px 28px;
    background: #8a63b4cf;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .perfil-tab:hover {
    color: #ffffff;
    background: #9573c4;
  }

  .perfil-tab.activa {
    color: #ffffff;
    background: #7439b3;
  }

  .perfil-contenido {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-bottom: 60px;
  }

  .perfil-seccion {
    background: #9c70ccaf;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 6px 18px rgba(60, 60, 226, 0.4);
    width: 100%;
    box-sizing: border-box;
  }

  .perfil-seccion h2 {
    color: #ffffff;
    font-size: 20px;
    margin: 0 0 24px 0;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  .perfil-seccion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }

  .perfil-seccion-header h2 {
    margin: 0;
    padding: 0;
    border: none;
  }

  .perfil-btn-editar {
    background: #7439b3;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .perfil-btn-editar:hover { 
    background: #65319c; 
  }

  .perfil-detalles { 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
  }

  .perfil-detalle {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .perfil-detalle:last-child { 
    border-bottom: none; 
    padding-bottom: 0; 
  }

  .perfil-label { 
    color: rgba(255, 255, 255, 0.8); 
    font-size: 14px; font-weight: 500; 
  }

  .perfil-valor { 
    color: #ffffff; 
    font-size: 16px; 
    font-weight: 600; 
  }

  .perfil-form { 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
  }

  .perfil-campo { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
  }

  .perfil-campo label { 
    color: rgba(255, 255, 255, 0.9); 
    font-size: 14px; 
    font-weight: 500; 
  }

  .perfil-campo input {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    font-size: 15px;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .perfil-campo input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.25);
  }

  .perfil-campo input::placeholder { 
    color: rgba(255, 255, 255, 0.5); 
  }

  .perfil-btn {
    margin-top: 8px;
    padding: 12px 24px;
    background: #7439b3;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
    font-family: inherit;
  }

  .perfil-btn:hover { 
    background: #65319c; 
  }

  .perfil-btn:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
  }

  .perfil-exito { 
    color: #4ade80; 
    font-size: 14px; 
    margin: 0; 
    font-weight: 500; 
  }

  .perfil-error { 
    color: #fca5a5; 
    font-size: 14px; 
    margin: 0; 
    font-weight: 500; 
  }

  .ajustes-grupo { 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
  }

  .ajustes-subgrupo { 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
    align-items: center; 
  }

  .ajuste-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .ajuste-info h3 { 
    margin: 0 0 4px 0; 
    color: #ffffff; 
    font-size: 16px; 
    font-weight: 600; 
  }

  .ajuste-info p { 
    margin: 0; 
    color: rgba(255, 255, 255, 0.7); 
    font-size: 14px; 
  }

  .ajuste-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
    flex-shrink: 0;
  }

  .ajuste-switch input { 
    opacity: 0; 
    width: 0; 
    height: 0; 
  }

  .ajuste-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.3);
    transition: 0.3s;
    border-radius: 34px;
  }

  .ajuste-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .ajuste-switch input:checked + .ajuste-slider { 
    background-color: #7439b3; 
  }

  .ajuste-switch input:checked + .ajuste-slider:before { 
    transform: translateX(24px); 
  }

  .ajustes-separador { 
    height: 2px; 
    background: rgba(255, 255, 255, 0.2); 
    margin: 24px 0; 
  }

  .ajustes-subtitulo { 
    color: #ffffff; 
    font-size: 18px; 
    font-weight: 600; 
    margin: 0 0 16px 0; 
  }

  .perfil-btn-peligro {
    padding: 12px 24px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    width: fit-content;
  }

  .perfil-btn-peligro:hover { 
    background: linear-gradient(135deg, #c0392b 0%, #a93226 100%); 
  }

  .ajustes-advertencia { 
    color: rgba(255, 255, 255, 0.7); 
    font-size: 14px; 
    margin: 12px 0 0 0; 
  }

  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal-delete-overlay {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 0;
  }

  .modal-delete {
    position: absolute;
    background: linear-gradient(135deg, #8a63b4 0%, #6b4399 100%);
    border-radius: 12px;
    padding: 24px 28px;
    max-width: 380px;
    width: calc(100vw - 40px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.2);
    animation: modalDeleteIn 0.3s ease;
  }

  @keyframes modalDeleteIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .modal-delete--top-left { 
    top: 15%; 
    left: 8%; 
  }

  .modal-delete--top-right { 
    top: 15%; 
    right: 8%; 
    left: auto; 
  }

  .modal-delete--bottom-right { 
    bottom: 15%; 
    right: 8%; 
    left: auto; 
    top: auto; 
  }

  .modal-delete--bottom-left { 
    bottom: 15%; 
    left: 8%; 
    top: auto; 
  }

  .modal-delete-msg { 
    color: #fff; 
    font-size: 16px; 
    line-height: 1.5; 
    margin: 0 0 20px 0; 
    font-weight: 500; 
  }

  .modal-delete-actions { 
    display: flex; 
    gap: 12px; 
    justify-content: flex-end; 
  }

  .modal-delete-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .modal-delete-btn--cancel {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
  }

  .modal-delete-btn--cancel:hover { 
    background: rgba(255, 255, 255, 0.3); 
  }

  .modal-delete-btn--confirm { 
    background: #e74c3c; 
    border: none; 
    color: white; }

  .modal-delete-btn--confirm:hover:not(:disabled) { 
    background: #c0392b; 
  }

  .modal-delete-btn:disabled { 
    opacity: 0.6; 
    cursor: not-allowed; 
  }

  .modal-contenido {
    background: #8a63b4;
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .modal-header h2 { 
    margin: 0; 
    font-size: 24px; 
    color: #ffffff; 
    font-weight: 600; 
  }

  .modal-cerrar {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    color: white;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 8px;
    width: 36px;
    height: 36px;
  }

  .modal-cerrar:hover { 
    background: rgba(255, 255, 255, 0.3); 
  }

  @media (max-width: 768px) {
    .modal-delete--top-left { 
      top: 10%; 
      left: 5%; 
    }

    .modal-delete--top-right { 
      top: 10%; 
      right: 5%; 
    }

    .modal-delete--bottom-right { 
      bottom: 10%; 
      right: 5%; 
    }

    .modal-delete--bottom-left { 
      bottom: 10%; 
      left: 5%; 
    }

    .perfil-container {
      flex-direction: column;
      margin-top: 20px;
      padding: 0 16px;
    }

    .perfil-tabs {
      flex-direction: row;
      position: static;
      width: 100%;
      overflow-x: auto;
      flex-wrap: wrap;
    }

    .perfil-tab {
      padding: 10px 16px;
      font-size: 14px;
      flex: 1;
      min-width: 120px;
      text-align: center;
    }

    .perfil-seccion { 
      padding: 20px; 
      border-radius: 8px; 
    }

    .perfil-seccion h2 { 
      font-size: 18px; 
    }

    .perfil-seccion-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .perfil-btn-editar { 
      width: 100%; 
    }

    .perfil-detalles { 
      gap: 16px; 
    }

    .perfil-detalle { 
      padding-bottom: 16px; 
    }

    .perfil-label { 
      font-size: 13px; 
    }

    .perfil-valor { 
      font-size: 15px; 
      word-break: break-word; 
    }

    .perfil-btn { 
      width: 100%; 
      text-align: center; 
    }

    .perfil-btn-peligro { 
      width: 100%; 
    }

    .modal-contenido { 
      padding: 20px; 
      margin: 10px; 
    }

    .modal-header h2 { 
      font-size: 20px; 
    }
  }

  @media (max-width: 480px) {
    .perfil-container { 
      padding: 0 12px; 
      gap: 20px; 
    }

    .perfil-seccion { 
      padding: 16px; 
    }

    .perfil-seccion h2 { 
      font-size: 16px; 
      margin-bottom: 16px; 
    }

    .perfil-detalles { 
      gap: 12px; 
    }

    .perfil-campo input {
      padding: 10px 14px;
      font-size: 14px;
    }

    .perfil-btn,
    .perfil-btn-editar,
    .perfil-btn-peligro {
      padding: 10px 20px;
      font-size: 14px;
    }

    .perfil-tab { 
      padding: 8px 12px; 
      font-size: 13px; 
      min-width: 100px; 
    }

    .ajuste-item {
      padding: 12px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .ajuste-switch { 
      align-self: flex-end; 
    }
  }

</style>