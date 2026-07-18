const BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`)
    error.status = response.status
    throw error
  }

  return data
}

export const adminApi = {
  login: (username, password) =>
    request('/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request('/admin-login', { method: 'DELETE' }),

  getSummary: () =>
    request('/admin-summary', { method: 'GET' }),

  getTickets: () =>
    request('/admin-tickets', { method: 'GET' }),

  assignTicket: (customer_name, customer_phone) =>
    request('/admin-assign-ticket', {
      method: 'POST',
      body: JSON.stringify({ customer_name, customer_phone }),
    }),

  createAdmin: (username, password, role) =>
    request('/admin-manage-admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', username, password, role }),
    }),

  deactivateAdmin: (target_id) =>
    request('/admin-manage-admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'deactivate', target_id }),
    }),

  reactivateAdmin: (target_id) =>
    request('/admin-manage-admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'reactivate', target_id }),
    }),

  voidTicket: (ticket_id) =>
    request('/admin-manage-admins', {
      method: 'POST',
      body: JSON.stringify({ action: 'void_ticket', ticket_id }),
    }),

  listAdmins: () =>
    request('/admin-list', { method: 'GET' }),

  resetPlatform: () =>
    request('/admin-reset', { method: 'POST' }),
}

export const publicApi = {
  revealTicket: (otp) =>
    request('/reveal', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),
}
