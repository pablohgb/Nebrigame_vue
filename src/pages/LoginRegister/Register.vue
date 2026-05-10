<template>

  <div class="page-wrapper">
    <div class="background-register">
      <SimpleHeader />
      <div class="auth-container-reg">
        <div class="auth-card-reg">
          <div class="auth-header-reg">
            <h1>Crear cuenta</h1>
            <p>Rellena el formulario para registrarte</p>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form-reg">
            <div class="form-row-reg">
              <div class="form-group-reg">
                <label for="nombre">Nombre <span class="must-do">*</span></label>
                <input type="text" id="nombre" v-model="formData.nombre" placeholder="Nombre" required />
              </div>
            </div>

            <div class="form-row-reg">
              <div class="form-group-reg">
                <label for="apellido1">Apellido <span class="must-do">*</span></label>
                <input type="text" id="apellido1" v-model="formData.apellido1" placeholder="Primer apellido" required />
              </div>
              <div class="form-group-reg">
                <label for="apellido2">Apellido</label>
                <input type="text" id="apellido2" v-model="formData.apellido2" placeholder="Segundo apellido" />
              </div>
            </div>

            <div class="form-row-reg">
              <div class="form-group-reg">
                <label for="email">Email <span class="must-do">*</span></label>
                <input type="email" id="email" v-model="formData.email" placeholder="tu@email.com" required />
              </div>
              <div class="form-group-reg">
                <label for="emailConfirmar">Confirma tu email <span class="must-do">*</span></label>
                <input type="email" id="emailConfirmar" v-model="formData.emailConfirmar" placeholder="tu@email.com"
                  required />
              </div>
            </div>

            <div class="form-row-reg">
              <div class="form-group-reg">
                <label for="contrasenna">Contraseña <span class="must-do">*</span></label>
                <input type="password" id="contrasenna" v-model="formData.contrasenna" placeholder="••••••••"
                  required />
              </div>
              <div class="form-group-reg">
                <label for="contrasennaConfirmar">Confirma tu contraseña <span class="must-do">*</span></label>
                <input type="password" id="contrasennaConfirmar" v-model="formData.contrasennaConfirmar"
                  placeholder="••••••••" required />
              </div>
            </div>

            <div v-if="error" class="error-message-reg">{{ error }}</div>

            <div class="btn-cont-reg">
              <button type="submit" class="btn-primary-reg">Registrarse</button>
            </div>

            <p class="must-do-p">* Campos obligatorios</p>

            <div class="auth-switch-reg">
              <p>¿Ya tienes una cuenta?</p>
              <button type="button" @click="router.push('/login')" class="btn-link-reg">
                Inicia sesión aquí
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Footer />
  </div>

</template>


<script setup>

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SimpleHeader from '../../components/SimpleHeader/SimpleHeader.vue'
import Footer from '../../components/Footer/Footer.vue'
import { useUserStore } from '../../stores/userStore'
import { toast } from '../../stores/toastStore'

const router = useRouter()
const userStore = useUserStore()
const error = ref(null)

onMounted(() => {
  if (userStore.id) router.replace('/')
})

const formData = reactive({
  nombre: '',
  apellido1: '',
  apellido2: '',
  email: '',
  emailConfirmar: '',
  contrasenna: '',
  contrasennaConfirmar: ''
})

const handleSubmit = async () => {
  error.value = null

  if (formData.email !== formData.emailConfirmar) {
    error.value = 'Los emails no coinciden'
    return
  }

  if (formData.contrasenna !== formData.contrasennaConfirmar) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  try {
    const apiUrl = import.meta.env.VITE_BACK_CONNECTION
    const res = await fetch(`${apiUrl}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        email: formData.email,
        contrasenna: formData.contrasenna
      })
    })

    const data = await res.json()

    if (data.success) {
      userStore.setUsuario(
        data.usuario.id,
        data.usuario.nombre,
        data.usuario.apellido1,
        data.usuario.apellido2,
        data.usuario.email,
        null
      )
      if (data.accessToken) userStore.setAccessToken(data.accessToken)
      if (data.refreshToken) userStore.setRefreshToken(data.refreshToken)
      toast.success('Cuenta creada correctamente, bienvenido ' + data.usuario.nombre)
      router.replace('/')
    } else {
      error.value = data.message || 'Error al registrarse'
      toast.error(data.message || 'Error al registrarse')
    }

  } catch (err) {
    console.error('Error en el registro:', err)
    error.value = err.message || 'Error al registrarse'
    toast.error('Error al registrarse')
  }
}

</script>


<style scoped>
.background-register {
  background-image: url('../../assets/images/backgroundLogin.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.auth-container-reg {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.auth-card-reg {
  background: rgba(255, 255, 255, 0.747);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  animation: slideIn 0.4s ease-out;
  margin: 40px 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header-reg {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header-reg h1 {
  color: #642f99dc;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.auth-header-reg p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.error-message-reg {
  background-color: #fdecea;
  color: #b9291f;
  border: 2px solid #f5c2be;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 12px;
}

.auth-form-reg {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row-reg {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.form-row-reg .form-group-reg {
  flex: 1;
}

.form-group-reg {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-reg label {
  color: #642f99dc;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.form-group-reg input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.form-group-reg input:focus {
  border-color: #3a8dbd;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group-reg input::placeholder {
  color: #999;
}

.form-group-reg input:hover {
  border-color: #c0c0c0;
}

.btn-primary-reg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-cont-reg {
  display: flex;
  justify-content: center;
}

.btn-primary-reg:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary-reg:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.btn-link-reg {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
  transition: color 0.2s ease;
  font-family: inherit;
}

.btn-link-reg:hover {
  color: #764ba2;
  text-decoration: underline;
}

.auth-switch-reg {
  text-align: center;
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.auth-switch-reg p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.must-do {
  color: #b9291f;
  font-weight: 600;
}

.must-do-p {
  color: #b9291f;
  font-size: 14px;
}

@media (max-width: 768px) {
  .auth-container-reg {
    min-height: auto;
    align-items: flex-start;
    padding-top: 20px;
  }

  .auth-card-reg {
    padding: 35px 25px;
  }

  .auth-header-reg h1 {
    font-size: 26px;
  }

  .auth-form-reg {
    gap: 16px;
  }

  .form-row-reg {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .auth-container-reg {
    padding: 30px 15px;
  }

  .auth-card-reg {
    padding: 30px 20px;
  }

  .auth-header-reg h1 {
    font-size: 24px;
  }

  .auth-header-reg p {
    font-size: 13px;
  }

  .form-group-reg input {
    padding: 11px 14px;
    font-size: 14px;
  }

  .btn-primary-reg {
    padding: 13px 18px;
    font-size: 15px;
  }

  .auth-switch-reg {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-height: 700px) {
  .auth-container-reg {
    padding: 30px 20px;
  }

  .auth-card-reg {
    padding: 30px;
  }

  .auth-form-reg {
    gap: 14px;
  }
}
</style>