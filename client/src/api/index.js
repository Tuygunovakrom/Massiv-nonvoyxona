import http from './http';

export const authApi = {
  login: (payload) => http.post('/auth/login', payload).then((r) => r.data),
};

export const bakerApi = {
  getDay: (date) => http.get('/reports/mine', { params: { date } }).then((r) => r.data),
  saveReport: (payload) => http.put('/reports/mine', payload).then((r) => r.data),
  closeDay: (date) => http.post('/reports/mine/close', { date }).then((r) => r.data),
  giveDriver: (payload) => http.post('/handoffs', payload).then((r) => r.data),
};

export const driverApi = {
  getDay: (date) => http.get('/driver/day', { params: { date } }).then((r) => r.data),
  confirm: (id, quantity) => http.put(`/handoffs/${id}/confirm`, { quantity }).then((r) => r.data),
  addDelivery: (payload) => http.post('/deliveries', payload).then((r) => r.data),
  closeDay: (date) => http.post('/driver/day/close', { date }).then((r) => r.data),
};

export const sharedApi = {
  orders: (date) => http.get('/orders', { params: { date } }).then((r) => r.data),
  createOrder: (payload) => http.post('/orders', payload).then((r) => r.data),
  doneOrder: (id) => http.put(`/orders/${id}/done`).then((r) => r.data),
  addExpense: (payload) => http.post('/expenses', payload).then((r) => r.data),
  addComment: (payload) => http.post('/comments', payload).then((r) => r.data),
};

export const adminApi = {
  day: (date) => http.get('/admin/day', { params: { date } }).then((r) => r.data),
  update: (kind, id, data) => http.put(`/admin/${kind}/${id}`, data).then((r) => r.data),
  reopen: (id) => http.post(`/admin/reports/${id}/reopen`).then((r) => r.data),
  reopenDriverDay: (id) => http.post(`/admin/driverdays/${id}/reopen`).then((r) => r.data),
  audit: () => http.get('/admin/audit').then((r) => r.data),
  users: () => http.get('/users').then((r) => r.data),
  createUser: (payload) => http.post('/users', payload).then((r) => r.data),
  updateUser: (id, payload) => http.put(`/users/${id}`, payload).then((r) => r.data),
  bakeries: () => http.get('/bakeries').then((r) => r.data),
  createBakery: (payload) => http.post('/bakeries', payload).then((r) => r.data),
  shops: () => http.get('/shops').then((r) => r.data),
  createShop: (payload) => http.post('/shops', payload).then((r) => r.data),
  updateShop: (id, payload) => http.put(`/shops/${id}`, payload).then((r) => r.data),
  comments: (status) => http.get('/comments', { params: status ? { status } : {} }).then((r) => r.data),
  resolveComment: (id) => http.put(`/comments/${id}/resolve`).then((r) => r.data),
};
