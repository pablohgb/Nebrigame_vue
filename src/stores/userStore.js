import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    nombre: null,
    apellido1: null,
    apellido2: null,
    email: null,
    fecha_registro: null
  }),

  actions: {
    setUsuario(id, nombre, apellido1, apellido2, email, fecha_registro) {
      this.id = id
      this.nombre = nombre
      this.apellido1 = apellido1
      this.apellido2 = apellido2
      this.email = email
      this.fecha_registro = fecha_registro
    },
    logout() {
      this.id = null
      this.nombre = null
      this.apellido1 = null
      this.apellido2 = null
      this.email = null
      this.fecha_registro = null
    }
  },

  persist: true
})