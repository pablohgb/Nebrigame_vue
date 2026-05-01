import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home/Home.vue'
import Login from '../pages/LoginRegister/Login.vue'
import Register from '../pages/LoginRegister/Register.vue'
import NotFound from '../pages/NotFound/NotFound.vue'
import Product from '../pages/Product/Product.vue'
import ProductDetail from '../pages/ProductDetail/ProductDetail.vue'
import Wishlist from '../pages/Wishlist/Wishlist.vue'
import Profile from '../pages/Profile/Profile.vue'
import Orders from '../pages/Orders/Orders.vue'
import Cart from '../pages/Cart/Cart.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    // { path: '/', name: 'Home', component: Home },
    { path: '/login', component: Login}, 
    { path: '/register', component: Register},
    { path: '/:pathMatch(.*)*', component: NotFound }, 
    { path: '/productos', component: Product }, 
    { path: '/productos/:tipo', component: Product },
    { path: '/producto/:tipo/:id', component: ProductDetail }, 
    { path: '/wishlist', component: Wishlist }, 
    { path: '/perfil', component: Profile },
    { path: '/pedidos', component: Orders }, 
    { path: '/carrito', component: Cart }
  ]
})

export default router


// TODO - Cambios: 
// esto '/:pathMatch(.*)*'  es en VUE lo que en REACT es path="*"  --> para que cualquier ruta que no exista redirija a NotFound.vue