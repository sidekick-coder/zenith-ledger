const PREFIX = '/ledger'

export function route(path: string) {
    return PREFIX + path
}

export function adminRoute(path: string) {
    return '/admin' + PREFIX + path
}