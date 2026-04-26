import { ref, watch, onUnmounted } from 'vue'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const useCart = (userId) => {
    const cart = ref([])
    const loading = ref(true)
    let controller = null

    const fetchCart = async (id) => {
        if (!id) {
            cart.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/usuarios/${id}/carrito`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            cart.value = data.carrito || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching cart:', err)
            cart.value = []
        } finally {
            loading.value = false
        }
    }

    watch(() => userId, (id) => fetchCart(id), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { cart, loading }
}

const addCart = async (userId, productoId, cantidad, plataformaId = null) => {
    const body = { producto_id: productoId, cantidad: cantidad ?? 1 }

    if (plataformaId != null && plataformaId !== 0) {
        body.plataforma_id = plataformaId
    }

    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/carrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        if (!res.ok) {
            const msg = data.stockDisponible !== undefined
                ? `${data.error || 'Stock insuficiente'}. Disponible: ${data.stockDisponible}`
                : (data.error || 'Error al añadir al carrito')
            throw new Error(msg)
        }

        return data

    } catch (err) {
        console.error('Error adding to cart:', err)
        throw err
    }
}

const changeQuantity = async (userId, productoId, cantidad, plataformaId = 0) => {
    const body = { cantidad }

    if (plataformaId != null) body.plataforma_id = plataformaId

    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/carrito/${productoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        if (!res.ok) {
            const msg = data.stockDisponible !== undefined
                ? `${data.error || 'Stock insuficiente'}. Disponible: ${data.stockDisponible}`
                : (data.error || 'Error al actualizar cantidad del producto')
            throw new Error(msg)
        }

        return data

    } catch (err) {
        console.error('Error updating quantity:', err)
        throw err
    }
}

const deleteCart = async (userId, productoId, plataformaId = 0) => {
    const url = new URL(`${apiUrl}/usuarios/${userId}/carrito/${productoId}`)

    if (plataformaId != null) url.searchParams.set('plataforma_id', plataformaId)

    try {
        const res = await fetch(url.toString(), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plataforma_id: plataformaId })
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Error al eliminar del carrito')

        return data

    } catch (err) {
        console.error('Error deleting from cart:', err)
        throw err
    }
}

const validateCartStock = async (userId) => {
    const res = await fetch(`${apiUrl}/usuarios/${userId}/carrito/validar-stock`)
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Error al validar stock')
    return data
}

export { useCart, addCart, changeQuantity, deleteCart, validateCartStock }