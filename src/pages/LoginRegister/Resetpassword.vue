<template>
  <div class="page-wrapper">
    <div class="background-login">
      <SimpleHeader />
      <div class="auth-container-log">
        <div class="auth-card-log">
          <div class="auth-header-log">
            <h1>Nueva contraseña</h1>
            <p>Introduce tu nueva contraseña para acceder a tu cuenta</p>
          </div>

          <!-- Estado: token inválido o no presente -->
          <div v-if="!token" class="confirmation-log">
            <div class="error-icon-log">⚠️</div>
            <p>El enlace no es válido o ha caducado.</p>
            <p class="small-text-log">
              Solicita un nuevo enlace de recuperación si lo necesitas.
            </p>
            <div class="btn-cont-log" style="margin-top: 20px;">
              <button
                type="button"
                @click="router.push('/recuperar-password')"
                class="btn-primary-log"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          </div>

          <!-- Estado: formulario -->
          <form v-else-if="!completado" @submit.prevent="handleSubmit" class="auth-form-log">
            <div class="form-group-log">
              <label for="contrasennaNueva">Nueva contraseña</label>
              <input
                type="password"
                id="contrasennaNueva"
                v-model="formData.contrasennaNueva"
                placeholder="••••••••"
              />
            </div>

            <div class="form-group-log">
              <label for="confirmacion">Repite la contraseña</label>
              <input
                type="password"
                id="confirmacion"
                v-model="formData.confirmacion"
                placeholder="••••••••"
              />
            </div>

            <div class="btn-cont-log">
              <button type="submit" class="btn-primary-log" :disabled="loading">
                {{ loading ? "Guardando..." : "Restablecer contraseña" }}
              </button>
            </div>
          </form>

          <!-- Estado: completado -->
          <div v-else class="confirmation-log">
            <div class="success-icon-log">✅</div>
            <p>¡Tu contraseña ha sido restablecida correctamente!</p>
            <p class="small-text-log">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <div class="btn-cont-log" style="margin-top: 20px;">
              <button
                type="button"
                @click="router.push('/login')"
                class="btn-primary-log"
              >
                Ir al login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import SimpleHeader from "../../components/SimpleHeader/SimpleHeader.vue";
import Footer from "../../components/Footer/Footer.vue";
import { toast } from "../../stores/toastStore";
import { resetPassword } from "../../api/useAuth";

const router = useRouter();
const route = useRoute();
const token = ref(route.query.token || "");
const completado = ref(false);
const loading = ref(false);

const formData = reactive({
  contrasennaNueva: "",
  confirmacion: "",
});

const handleSubmit = async () => {
  if (!formData.contrasennaNueva || !formData.confirmacion) {
    toast.error("Por favor, rellena ambos campos");
    return;
  }

  if (formData.contrasennaNueva.length < 6) {
    toast.error("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (formData.contrasennaNueva !== formData.confirmacion) {
    toast.error("Las contraseñas no coinciden");
    return;
  }

  loading.value = true;
  try {
    await resetPassword(token.value, formData.contrasennaNueva);
    completado.value = true;
  } catch (error) {
    toast.error(error.message || "Error al restablecer la contraseña");
    // Si el token es inválido o ha caducado, lo limpiamos para mostrar el mensaje de error
    if (error.message?.includes("caducado") || error.message?.includes("válido")) {
      token.value = "";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.background-login {
  background-image: url("../../assets/images/backgroundLogin.jpeg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
}

.auth-container-log {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  margin-bottom: 12px;
}

.auth-card-log {
  background: rgba(255, 255, 255, 0.747);
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  animation: slideIn 0.4s ease-out;
  margin: 40px 0;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-header-log {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header-log h1 {
  color: #642f99dc;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.auth-header-log p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.auth-form-log {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group-log {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-log label {
  color: #642f99dc;
  font-size: 14px;
  font-weight: 500;
}

.form-group-log input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: #fff;
}

.form-group-log input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary-log {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-log:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary-log:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cont-log {
  display: flex;
  justify-content: center;
}

.confirmation-log {
  text-align: center;
  color: #333;
}

.success-icon-log,
.error-icon-log {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirmation-log p {
  font-size: 15px;
  line-height: 1.6;
  margin: 8px 0;
}

.small-text-log {
  font-size: 13px;
  color: #888;
  margin-top: 12px !important;
}
</style>