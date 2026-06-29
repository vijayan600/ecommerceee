import api from './axios.js'

// AUTH
export async function loginUser(email, password) {
  try {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function registerUser(name, email, phone, password) {
  try {
    const res = await api.post('/auth/register', { name, email, phone, password })
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function getMe() {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

// PRODUCTS
export async function getAllProducts() {
  try {
    const res = await api.get('/products')
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function getProductById(id) {
  try {
    const res = await api.get(`/products/${id}`)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function addProduct(productData) {
  try {
    const res = await api.post('/products', productData)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function updateProduct(id, productData) {
  try {
    const res = await api.put(`/products/${id}`, productData)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function deleteProduct(id) {
  try {
    const res = await api.delete(`/products/${id}`)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

// ORDERS
export async function createOrder(orderData) {
  try {
    const res = await api.post('/orders', orderData)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function getMyOrders() {
  try {
    const res = await api.get('/orders/my-orders')
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function getOrderById(id) {
  try {
    const res = await api.get(`/orders/${id}`)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

// PAYMENT
export async function createRazorpayOrder(amount, currency = 'INR') {
  try {
    const res = await api.post('/payment/create-order', { amount, currency })
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function verifyPayment(paymentData) {
  try {
    const res = await api.post('/payment/verify', paymentData)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

// ADMIN
export async function adminGetAllOrders(status) {
  try {
    const url = status ? `/admin/orders?status=${encodeURIComponent(status)}` : '/admin/orders'
    const res = await api.get(url)
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function adminUpdateOrderStatus(orderId, status) {
  try {
    const res = await api.patch(`/admin/orders/${orderId}/status`, { status })
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function adminGetDashboard() {
  try {
    const res = await api.get('/admin/dashboard')
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function adminGetCustomers() {
  try {
    const res = await api.get('/admin/customers')
    return res.data
  } catch (error) {
    const err = error?.response?.data?.detail || error?.response?.data || error.message
    throw err
  }
}

export async function adminAddProduct(data) {
  return addProduct(data)
}

export async function adminUpdateProduct(id, data) {
  return updateProduct(id, data)
}

export async function adminDeleteProduct(id) {
  return deleteProduct(id)
}
