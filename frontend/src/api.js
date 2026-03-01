function getBaseUrl() {
  if (typeof window !== 'undefined' && window.__CAMPUSCOIN_API_URL__) {
    return window.__CAMPUSCOIN_API_URL__.trim() || null
  }
  if (import.meta.env.VITE_MODAL_URL) {
    return import.meta.env.VITE_MODAL_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  return null
}

const BASE_URL = getBaseUrl()

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error(
      'API URL not configured. For production: add the VITE_MODAL_URL secret in GitHub (Settings → Secrets and variables → Actions) and redeploy.'
    )
  }
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API error ${res.status}: ${error}`)
  }
  return res.json()
}

export const api = {
  // Profile
  getProfile: (userId) =>
    request(`/api/profile/${userId}`),
  saveProfile: (userId, data) =>
    request(`/api/profile/${userId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Runway
  calculateRunway: (payload) =>
    request('/api/runway/calculate', { method: 'POST', body: JSON.stringify(payload) }),

  // AI
  analyzeFinances: (payload) =>
    request('/api/ai/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (payload) =>
    request('/api/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),

  // Nessie — Read
  getNessieBalance: (accountId) =>
    request(`/api/nessie/balance/${accountId}`),
  getNessieDeposits: (accountId) =>
    request(`/api/nessie/deposits/${accountId}`),
  getNessiePurchases: (accountId) =>
    request(`/api/nessie/purchases/${accountId}`),
  getNessieTransactions: (accountId) =>
    request(`/api/nessie/transactions/${accountId}`),
  getNessieBills: (accountId) =>
    request(`/api/nessie/bills/${accountId}`),
  listNessieAccounts: () =>
    request('/api/nessie/accounts'),

  // Nessie — Write
  createNessieAccount: (payload) =>
    request('/api/nessie/create-account', { method: 'POST', body: JSON.stringify(payload) }),
  createNessieDeposit: (payload) =>
    request('/api/nessie/deposit', { method: 'POST', body: JSON.stringify(payload) }),
  createNessiePurchase: (payload) =>
    request('/api/nessie/purchase', { method: 'POST', body: JSON.stringify(payload) }),
  createNessieBill: (payload) =>
    request('/api/nessie/bill', { method: 'POST', body: JSON.stringify(payload) }),

  // Academic Ingestion (multipart file upload)
  ingestAcademic: async (file, userId = 'anonymous') => {
    if (!BASE_URL) {
      throw new Error('API URL not configured.')
    }
    const form = new FormData()
    form.append('file', file)
    form.append('user_id', userId)
    const res = await fetch(`${BASE_URL}/api/ai/ingest_academic`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`API error ${res.status}: ${error}`)
    }
    return res.json()
  },

  // Supermemory
  storeMemory: (profile) =>
    request('/api/memory/store', { method: 'POST', body: JSON.stringify({ profile }) }),
  recallMemory: (userId) =>
    request(`/api/memory/recall/${userId}`),

  // Auth
  signup: (payload) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  changePassword: (payload) =>
    request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAccount: (payload) =>
    request('/api/auth/delete-account', { method: 'POST', body: JSON.stringify(payload) }),

  // Health
  health: () =>
    request('/api/health'),
}
