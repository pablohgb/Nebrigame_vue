import { ref, watch, onUnmounted } from 'vue'
import { parseId } from '../utils/parseId'
import { apiFetch } from './apiClient'

const usePayment = (userId) => {
    const payment = ref([])
    const loading = ref(true)
    let controller = null

    const fetchPayment = async () => {
        const id = parseId(userId)
        if (!id) {
            payment.value = []
            loading.value = false
            return
        }

        controller?.abort()
        controller = new AbortController()
        loading.value = true

        try {
            const res = await apiFetch(`/usuarios/${id}/metodos-pago`, { signal: controller.signal })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            payment.value = data.metodosPago || []
        } catch (err) {
            if (err.name === 'AbortError') return
            console.error('Error fetching payment methods:', err)
            payment.value = []
        } finally {
            loading.value = false
        }
    }

    const refetchPayment = fetchPayment

    watch(() => parseId(userId), () => fetchPayment(), { immediate: true })
    onUnmounted(() => controller?.abort())

    return { payment, loading, refetchPayment }
}

const addPaymentMethod = async (userId, tipo, detalles) => {
    try {
        const res = await apiFetch(`/usuarios/${userId}/metodos-pago`, {
            method: 'POST',
            body: JSON.stringify({ tipo, detalles })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al añadir método de pago')
        return data

    } catch (err) {
        console.error('Error adding payment method:', err)
        throw err
    }
}

const deletePaymentMethod = async (userId, metodoId) => {
    try {
        const res = await apiFetch(`/usuarios/${userId}/metodos-pago/${metodoId}`, {
            method: 'DELETE'
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al eliminar método de pago')
        return data

    } catch (err) {
        console.error('Error deleting payment method:', err)
        throw err
    }
}

export { usePayment, addPaymentMethod, deletePaymentMethod }
