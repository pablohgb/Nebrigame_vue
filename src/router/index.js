import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home/Home.vue'
import Login from '../pages/LoginRegister/Login.vue'
import Register from '../pages/LoginRegister/Register.vue'
import ForgotPassword from '../pages/LoginRegister/Forgotpassword.vue'
import ResetPassword from '../pages/LoginRegister/ResetPassword.vue'
import NotFound from '../pages/NotFound/NotFound.vue'
import Product from '../pages/Product/Product.vue'
import ProductDetail from '../pages/ProductDetail/ProductDetail.vue'
import Wishlist from '../pages/Wishlist/Wishlist.vue'
import Profile from '../pages/Profile/Profile.vue'
import Orders from '../pages/Orders/Orders.vue'
import Cart from '../pages/Cart/Cart.vue'
import Shipping from '../pages/Shipping/Shipping.vue'
import Payment from '../pages/Payment/Payment.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

    scrollBehavior(savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },

  routes: [
    { path: '/', component: Home },
    // { path: '/', name: 'Home', component: Home },
    { path: '/login', component: Login}, 
    { path: '/registro', component: Register},
    { path: '/recuperar-contraseña', component: ForgotPassword},
    { path: '/restablecer-contraseña', component: ResetPassword },
    { path: '/productos', component: Product }, 
    { path: '/productos/:tipo', component: Product },
    { path: '/producto/:tipo/:id', component: ProductDetail }, 
    { path: '/wishlist', component: Wishlist }, 
    { path: '/perfil', component: Profile },
    { path: '/pedidos', component: Orders }, 
    { path: '/carrito', component: Cart }, 
    { path: '/envio', component: Shipping },
    { path: '/pago', component: Payment },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})

export default router


// TODO - Cambios: 
// esto '/:pathMatch(.*)*'  es en VUE lo que en REACT es path="*"  --> para que cualquier ruta que no exista redirija a NotFound.vue