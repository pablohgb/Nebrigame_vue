import { ref, watch, onUnmounted } from 'vue'
import { parseId } from '../utils/parseId'
import { apiFetch } from './apiClient'

const useCart = (userId) => {
    const cart = ref([])
    const loading = ref(true)
    let controller = null

    const fetchCart = async () => {
        const id = parseId(userId)
        if (!id) {
            cart.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await apiFetch(`/usuarios/${id}/carrito`, { signal: controller.signal })
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

    watch(() => parseId(userId), () => fetchCart(), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { cart, loading }
}

const addCart = async (userId, productoId, cantidad, plataformaId = null) => {
    const body = { producto_id: productoId, cantidad: cantidad ?? 1 }

    if (plataformaId != null && plataformaId !== 0) {
        body.plataforma_id = plataformaId
    }

    try {
        const res = await apiFetch(`/usuarios/${userId}/carrito`, {
            method: 'POST',
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
        const res = await apiFetch(`/usuarios/${userId}/carrito/${productoId}`, {
            method: 'PUT',
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
    const qs = new URLSearchParams()
    if (plataformaId != null) qs.set('plataforma_id', String(plataformaId))
    const q = qs.toString()
    const path = `/usuarios/${userId}/carrito/${productoId}${q ? `?${q}` : ''}`

    try {
        const res = await apiFetch(path, {
            method: 'DELETE',
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
    const res = await apiFetch(`/usuarios/${userId}/carrito/validar-stock`)
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Error al validar stock')
    return data
}

export { useCart, addCart, changeQuantity, deleteCart, validateCartStock }
