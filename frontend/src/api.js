const BASE_URL = import.meta.env.VITE_MODAL_URL || 'http://localhost:8000'

async function request(path, options = {}) {
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
  listNessieAccounts: () =>
    request('/api/nessie/accounts'),

  // Nessie — Write
  createNessieAccount: (payload) =>
    request('/api/nessie/create-account', { method: 'POST', body: JSON.stringify(payload) }),
  createNessieDeposit: (payload) =>
    request('/api/nessie/deposit', { method: 'POST', body: JSON.stringify(payload) }),
  createNessiePurchase: (payload) =>
    request('/api/nessie/purchase', { method: 'POST', body: JSON.stringify(payload) }),

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
