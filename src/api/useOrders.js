import { ref, watch, onUnmounted } from 'vue'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const useOrders = (userId) => {
    const orders = ref([])
    const loading = ref(true)
    let controller = null

    const fetchOrders = async (id) => {
        if (!id) {
            orders.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/usuarios/${id}/historial-compras`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            orders.value = data.pedidos || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching orders:', err)
            orders.value = []
        } finally {
            loading.value = false
        }
    }

    watch(() => userId, (id) => fetchOrders(id), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { orders, loading }
}

const createOrder = async (userId, orderData) => {
    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/carrito/comprar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || data.message || 'Error al crear pedido')
        return data

    } catch (error) {
        console.error('Error creating order:', error)
        throw error
    }
}

export { useOrders, createOrder }