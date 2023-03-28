// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true

// zależności CommonJS (takie jak runtime ajv oraz ajv-i18n) blokują usunięcie tej opcji
export const ssr = false
