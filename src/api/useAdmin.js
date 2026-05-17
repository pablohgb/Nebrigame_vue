import { apiFetch } from './apiClient'

export async function fetchIsAdmin() {
    const res = await apiFetch('/usuarios/isAdmin')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { isAdmin: false }
    return { isAdmin: !!data.isAdmin }
}

export async function deleteAdminProducto(productoId) {
    const res = await apiFetch(`/admin/productos/${productoId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo eliminar el producto')
    }
    return data
}

export async function updateAdminProducto(productoId, body) {
    const res = await apiFetch(`/admin/productos/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar el producto')
    }
    return data
}

export async function createAdminJuego(body) {
    const res = await apiFetch('/admin/juegos', {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo crear el juego')
    }
    return data
}

export async function updateAdminJuego(productoId, body) {
    const res = await apiFetch(`/admin/juegos/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar el juego')
    }
    return data
}

export async function createAdminConsola(body) {
    const res = await apiFetch('/admin/consolas', {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo crear la consola')
    }
    return data
}

export async function updateAdminConsola(productoId, body) {
    const res = await apiFetch(`/admin/consolas/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar la consola')
    }
    return data
}

export async function createAdminMerchandising(body) {
    const res = await apiFetch('/admin/merchandising', {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo crear el merchandising')
    }
    return data
}

export async function updateAdminMerchandising(productoId, body) {
    const res = await apiFetch(`/admin/merchandising/${productoId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar el merchandising')
    }
    return data
}

export async function fetchAdminPedidos({ q = '', filtro = 'id' } = {}) {
    const params = new URLSearchParams()
    if (q.trim()) {
        params.set('q', q.trim())
        params.set('filtro', filtro)
    }
    const qs = params.toString()
    const res = await apiFetch(`/admin/pedidos${qs ? `?${qs}` : ''}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudieron cargar los pedidos')
    }
    return data
}

export async function fetchAdminPedido(id) {
    const res = await apiFetch(`/admin/pedidos/${id}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo cargar el pedido')
    }
    return data
}

export async function patchAdminPedido(id, body) {
    const res = await apiFetch(`/admin/pedidos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || data.message || 'No se pudo actualizar el pedido')
    }
    return data
}
