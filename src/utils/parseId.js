import { unref } from 'vue'

export function parseId(maybeRef) {
    const v = unref(maybeRef)
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number.parseInt(String(v), 10)
    return Number.isFinite(n) && n > 0 ? n : null
}
