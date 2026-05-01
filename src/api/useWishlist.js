import { ref, watch, onUnmounted } from 'vue'
import { parseId } from '../utils/parseId'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const useWishlist = (userId) => {
    const wishlist = ref([])
    const loading = ref(true)
    let controller = null

    const fetchWishlist = async () => {
        const id = parseId(userId)
        if (!id) {
            wishlist.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/usuarios/${id}/wishlist`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()

            const productIds = data.wishlist.map(item => item.producto_id)
            const productPromises = productIds.map(productId =>
                fetch(`${apiUrl}/producto/${productId}`, { signal: controller.signal })
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                        return res.json()
                    })
                    .then(data => data.producto)
                    .catch(err => {
                        if (err.name !== 'AbortError') console.error(`Error fetching product ${productId}:`, err)
                        return null
                    })
            )

            const products = await Promise.all(productPromises)
            wishlist.value = products.filter(p => p !== null)

        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching wishlist:', err)
            wishlist.value = []
        } finally {
            loading.value = false
        }
    }

    const refetchWishlist = fetchWishlist

    watch(() => parseId(userId), () => fetchWishlist(), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { wishlist, loading, refetchWishlist }
}

const useIsInWishlist = (userId, productId) => {
    const isInWishlist = ref(false)
    const loading = ref(true)
    let controller = null

    const fetchIsInWishlist = async () => {
        const uId = parseId(userId)
        const pId = parseId(productId)

        if (!uId || !pId) {
            isInWishlist.value = false
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()

        try {
            const res = await fetch(`${apiUrl}/usuarios/${uId}/wishlist`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            const productIds = data.wishlist.map(item => Number(item.producto_id))
            isInWishlist.value = productIds.includes(pId)
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error checking wishlist:', err)
            isInWishlist.value = false
        } finally {
            loading.value = false
        }
    }

    watch([() => parseId(userId), () => parseId(productId)], () => fetchIsInWishlist(), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { isInWishlist, loading }
}

const addWishlist = async (userId, productoId) => {
    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: productoId })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al añadir a la wishlist')
        return data

    } catch (err) {
        console.error('Error adding to wishlist:', err)
        throw err
    }
}

const deleteWishlist = async (userId, productoId) => {
    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/wishlist/${productoId}`, {
            method: 'DELETE'
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al eliminar de la wishlist')
        return data

    } catch (err) {
        if (err.name !== 'AbortError') console.error('Error deleting from wishlist:', err)
        throw err
    }
}

export { useWishlist, useIsInWishlist, addWishlist, deleteWishlist }
