import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { FaDiscord, FaReddit, FaTwitch, FaXTwitter, FaInstagram, FaYoutube } from 'oh-vue-icons/icons'
import App from './App.vue'
import router from './router'
import './style.css'

addIcons(FaDiscord, FaReddit, FaTwitch, FaXTwitter, FaInstagram, FaYoutube)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.component('v-icon', OhVueIcon)

app.mount('#app')