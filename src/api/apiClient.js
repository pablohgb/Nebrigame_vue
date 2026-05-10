import { useUserStore } from '../stores/userStore'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION

async function refreshAccessToken(store) {
    if (!store.refreshToken) return false
    const res = await fetch(`${apiUrl}/usuarios/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: store.refreshToken }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.accessToken) {
        store.logout()
        return false
    }
    store.setAccessToken(data.accessToken)
    return true
}

export async function apiFetch(path, options = {}) {
    const store = useUserStore()
    const { headers: headerInit, _retried, ...rest } = options
    const isFormData = rest.body instanceof FormData

    const headers = new Headers(headerInit || {})
    if (!isFormData && rest.body != null && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }
    if (store.accessToken) {
        headers.set('Authorization', `Bearer ${store.accessToken}`)
    }

    const response = await fetch(`${apiUrl}${path}`, {
        ...rest,
        headers,
    })

    if (
        response.status === 401 &&
        !_retried &&
        path !== '/usuarios/refresh' &&
        store.refreshToken
    ) {
        const ok = await refreshAccessToken(store)
        if (ok) {
            return apiFetch(path, { ...options, _retried: true })
        }
    }

    return response
}
