<template>
  <div class="page-wrapper">
    <div class="background-login">
      <SimpleHeader />
      <div class="auth-container-log">
        <div class="auth-card-log">
          <div class="auth-header-log">
            <h1>Inicia sesión</h1>
            <p>Pon tu usuario y contraseña para entrar</p>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form-log">
            <div class="form-group-log">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="tu@email.com"
              />
            </div>

            <div class="form-group-log">
              <label for="contrasenna">Contraseña</label>
              <input
                type="password"
                id="contrasenna"
                v-model="formData.contrasenna"
                placeholder="••••••••"
              />
            </div>

            <div class="form-footer-log">
              <a href="#" class="forgot-password-log"
                >¿Olvidaste tu contraseña?</a
              >
            </div>

            <div class="btn-cont-log">
              <button type="submit" class="btn-primary-log">
                Iniciar Sesión
              </button>
            </div>

            <div class="auth-switch-log">
              <p>¿No tienes una cuenta?</p>
              <button
                type="button"
                @click="router.push('/registro')"
                class="btn-link-log"
              >
                Regístrate aquí
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

  import { reactive, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import SimpleHeader from "../../components/SimpleHeader/SimpleHeader.vue";
  import Footer from "../../components/Footer/Footer.vue";
  import { useUserStore } from "../../stores/userStore";
  import { toast } from "../../stores/toastStore";
  import { login } from "../../api/useAuth";
  import { getNavigationHistoryState } from "../../utils/navigationState";

  const router = useRouter();
  const userStore = useUserStore();

  const fromRaw = getNavigationHistoryState().from;
  const from = typeof fromRaw === "string" ? fromRaw : undefined;
  const validFrom = ["/carrito", "/wishlist"].includes(from) ? from : null;

  onMounted(() => {
    if (userStore.id) {
      router.replace(validFrom || "/");
    }
  });

  const formData = reactive({
    email: "",
    contrasenna: "",
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.contrasenna) {
      toast.error("Por favor, rellena todos los campos");
      return;
    }

    try {
      const data = await login(formData.email, formData.contrasenna);
      userStore.setUsuario(
        data.usuarioData.id,
        data.usuarioData.nombre,
        data.usuarioData.apellido1,
        data.usuarioData.apellido2,
        data.usuarioData.email,
        data.usuarioData.fecha_registro,
      );
      toast.success(
        "Sesión iniciada, bienvenido de nuevo " + data.usuarioData.nombre,
      );
      router.replace(validFrom || "/");
    } catch (error) {
      toast.error(error.message);
      formData.email = "";
      formData.contrasenna = "";
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
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    margin: 0;
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

  .form-group-log input::placeholder {
    color: #999;
  }
  .form-group-log input:hover {
    border-color: #c0c0c0;
  }

  .form-footer-log {
    display: flex;
    justify-content: flex-end;
    margin-top: -8px;
    margin-bottom: 4px;
  }

  .forgot-password-log {
    color: #667eea;
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s ease;
    font-weight: 500;
  }

  .forgot-password-log:hover {
    color: #764ba2;
    text-decoration: underline;
  }

  .btn-primary-log {
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

  .btn-cont-log {
    display: flex;
    justify-content: center;
  }

  .btn-primary-log:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .btn-primary-log:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
  }

  .btn-link-log {
    background: none;
    border: none;
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .btn-link-log:hover {
    color: #764ba2;
    text-decoration: underline;
  }

  .auth-switch-log {
    text-align: center;
    margin-top: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .auth-switch-log p {
    color: #666;
    font-size: 14px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .auth-container-log {
      min-height: auto;
      align-items: flex-start;
      justify-content: center;
      padding-top: 80px;
    }

    .auth-card-log {
      padding: 35px 25px;
    }

    .auth-header-log h1 {
      font-size: 26px;
    }

    .auth-form-log {
      gap: 16px;
    }
  }

  @media (max-width: 480px) {
    .auth-container-log {
      padding: 30px 15px;
    }

    .auth-card-log {
      padding: 30px 20px;
    }

    .auth-header-log h1 {
      font-size: 24px;
    }

    .auth-header-log p {
      font-size: 13px;
    }

    .form-group-log input {
      padding: 11px 14px;
      font-size: 14px;
    }

    .btn-primary-log {
      padding: 13px 18px;
      font-size: 15px;
    }

    .auth-switch-log {
      flex-direction: column;
      gap: 4px;
    }
  }

</style>
