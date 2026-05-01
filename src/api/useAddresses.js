import { ref, watch, onUnmounted } from 'vue'
import { parseId } from '../utils/parseId'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

const useAddresses = (userId) => {
    const addresses = ref([])
    const loading = ref(true)
    let controller = null

    const fetchAddresses = async () => {
        const id = parseId(userId)
        if (!id) {
            addresses.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await fetch(`${apiUrl}/usuarios/${id}/direcciones`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            addresses.value = data.direcciones || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching addresses:', err)
            addresses.value = []
        } finally {
            loading.value = false
        }
    }

    const refetchAddresses = fetchAddresses

    watch(() => parseId(userId), () => fetchAddresses(), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { addresses, loading, refetchAddresses }
}

const addAddress = async (userId, data) => {
    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/direcciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Error al añadir dirección')
        return result

    } catch (err) {
        console.error('Error adding address:', err)
        throw err
    }
}

const deleteAddress = async (userId, direccionId) => {
    try {
        const res = await fetch(`${apiUrl}/usuarios/${userId}/direcciones/${direccionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al eliminar dirección')
        return data

    } catch (err) {
        console.error('Error deleting address:', err)
        throw err
    }
}

export { useAddresses, addAddress, deleteAddress }
