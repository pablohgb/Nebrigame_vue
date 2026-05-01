export function getNavigationHistoryState() {
    if (typeof history === 'undefined' || history.state == null) return {}
    return typeof history.state === 'object' ? history.state : {}
}
