export function sanitizeLink(link, context = '') {
    const rawLink = (link || '').trim()
    if (!rawLink) {
        if (context) {
            return `https://www.google.com/search?q=${encodeURIComponent(context)}`
        }
        return '#'
    }

    try {
        const parsed = new URL(rawLink.startsWith('http') ? rawLink : `https://${rawLink}`)
        const hasDomain = parsed.hostname.includes('.') && parsed.hostname.length > 4
        const isInternal = parsed.hostname === 'localhost' ||
            parsed.hostname.startsWith('127.') ||
            parsed.hostname === window.location.hostname
        const isHashOnly = rawLink === '#' || rawLink.startsWith('#')

        if (isHashOnly || isInternal || !hasDomain) {
            throw new Error('invalid')
        }
        return parsed.href
    } catch {
        if (context) {
            return `https://www.google.com/search?q=${encodeURIComponent(context)}`
        }
        return `https://www.google.com/search?q=${encodeURIComponent(rawLink)}`
    }
}
