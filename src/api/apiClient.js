import { useUserStore } from '../stores/userStore'

const apiUrl = import.meta.env.VITE_BACK_CONNECTION


export async function apiFetch(path, options = {}) {
    const store = useUserStore()
    const { headers: headerInit, ...rest } = options
    const isFormData = rest.body instanceof FormData

    const headers = new Headers(headerInit || {})
    if (!isFormData && rest.body != null && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }
    if (store.accessToken) {
        headers.set('Authorization', `Bearer ${store.accessToken}`)
    }

    return fetch(`${apiUrl}${path}`, {
        ...rest,
        headers
    })
}
