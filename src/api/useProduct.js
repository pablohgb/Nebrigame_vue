import { ref, onMounted, onUnmounted, watch } from 'vue'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const useVideojuegos = () => {
    const videojuegos = ref([])
    const loading = ref(true)
    let controller = null

    onMounted(async () => {
        controller = new AbortController()
        try {
            const res = await fetch(`${apiUrl}/videojuegos`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            videojuegos.value = data.videojuegos || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching videojuegos:', err)
            videojuegos.value = []
        } finally {
            loading.value = false
        }
    })

    onUnmounted(() => controller?.abort())

    return { videojuegos, loading }
}

const useConsolas = () => {
    const consolas = ref([])
    const loading = ref(true)
    let controller = null

    onMounted(async () => {
        controller = new AbortController()
        try {
            const res = await fetch(`${apiUrl}/consolas`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            consolas.value = data.consolas || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching consolas:', err)
            consolas.value = []
        } finally {
            loading.value = false
        }
    })

    onUnmounted(() => controller?.abort())

    return { consolas, loading }
}

const useMerchandising = () => {
    const merchandising = ref([])
    const loading = ref(true)
    let controller = null

    onMounted(async () => {
        controller = new AbortController()
        try {
            const res = await fetch(`${apiUrl}/merchandising`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            merchandising.value = data.merchandising || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching merchandising:', err)
            merchandising.value = []
        } finally {
            loading.value = false
        }
    })

    onUnmounted(() => controller?.abort())

    return { merchandising, loading }
}

const useProductStock = (productoId) => {
    const stock = ref(0)
    const plataformas = ref(null)
    const loading = ref(true)
    let controller = null

    const fetchStock = async (id) => {
        if (!id) {
            stock.value = 0
            plataformas.value = null
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/producto/${id}/stock`, { signal: controller.signal })
            if (!res.ok) throw new Error('Error al obtener stock')
            const data = await res.json()
            stock.value = data.stock ?? 0
            plataformas.value = data.plataformas ?? null
        } catch (err) {
            if (err.name === 'AbortError') return
            stock.value = 0
            plataformas.value = null
        } finally {
            loading.value = false
        }
    }

    watch(() => productoId, (id) => fetchStock(id), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { stock, plataformas, loading }
}

const useOneProduct = (id) => {
    const product = ref(null)
    const loading = ref(true)
    let controller = null

    onMounted(async () => {
        controller = new AbortController()
        try {
            const res = await fetch(`${apiUrl}/producto/${id}`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            product.value = data.producto
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching product:', err)
            product.value = null
        } finally {
            loading.value = false
        }
    })

    onUnmounted(() => controller?.abort())

    return { product, loading }
}

const useSearch = (busqueda) => {
    const resultados = ref([])
    const loading = ref(false)
    let controller = null

    watch(busqueda, async (valor) => {
        if (!valor || valor.trim() === '') {
            resultados.value = []
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/buscar?q=${encodeURIComponent(valor)}`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            resultados.value = data.resultados || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error en búsqueda:', err)
            resultados.value = []
        } finally {
            loading.value = false
        }
    })

    onUnmounted(() => controller?.abort())

    return { resultados, loading }
}

export { useVideojuegos, useConsolas, useMerchandising, useSearch, useOneProduct, useProductStock }