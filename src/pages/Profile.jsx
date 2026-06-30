import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/services.js'
import { Loader2, User } from 'lucide-react'
import './Profile.css'

function formatMonthYear(dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString()
  } catch {
    return ''
  }
}

export default function Profile() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getMyOrders()
        const list = res?.orders || []
        if (mounted) setOrders(list)
      } catch (err) {
        setError(typeof err === 'string' ? err : err?.message || 'Failed to load orders')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (!user) return (
    <div className="profile-login-prompt">
      <div className="card">Please <a href="/login">login</a></div>
    </div>
  )

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)

  const lastAddress = orders.length > 0 ? orders[0].delivery_address : null

  function statusClasses(status) {
    switch (status) {
      case 'pending': return 'order-status status-pending'
      case 'confirmed': return 'order-status status-confirmed'
      case 'out_for_delivery': return 'order-status status-out_for_delivery'
      case 'delivered': return 'order-status status-delivered'
      default: return 'order-status status-default'
    }
  }

  function reorder(order) {
    try {
      const existing = JSON.parse(localStorage.getItem('cart') || '[]')
      const items = order.items.map(it => ({ product_id: it.product_id || it.product_id, name: it.name, price: it.price, quantity: it.quantity, image: it.image }))
      // merge quantities by product_id
      const map = new Map()
      existing.forEach(it => map.set(it.product_id, { ...it }))
      items.forEach(it => {
        const cur = map.get(it.product_id)
        if (cur) cur.quantity = Number(cur.quantity || 0) + Number(it.quantity || 0)
        else map.set(it.product_id, { ...it })
      })
      const merged = Array.from(map.values())
      localStorage.setItem('cart', JSON.stringify(merged))
      setMsg('Added to cart!')
      setTimeout(() => setMsg(null), 2000)
    } catch (e) {
      setMsg('Failed to add to cart')
      setTimeout(() => setMsg(null), 2000)
    }
  }

  // monthly summary (group by YYYY-MM)
  const groups = orders.reduce((acc, o) => {
    const d = new Date(o.created_at)
    if (isNaN(d)) return acc
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    if (!acc[key]) acc[key] = { month: key, orders: 0, total: 0 }
    acc[key].orders += 1
    acc[key].total += Number(o.total_amount) || 0
    return acc
  }, {})

  const months = Object.values(groups).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 3)

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div>
              <div className="profile-name">{user.name || '—'}</div>
              <div className="profile-meta">{user.email}</div>
              <div className="profile-meta">{user.phone || '—'}</div>
            </div>
          </div>

          <div className="profile-stats">
            <div><strong>Member since:</strong> {user.created_at ? formatMonthYear(user.created_at) : '—'}</div>
            <div className="spacer"><strong>Total spent:</strong> ₹{totalSpent.toFixed(2)}</div>
          </div>

          <button onClick={logout} className="logout-btn">Logout</button>
        </div>

        {/* Saved Address */}
        <div className="profile-card span-2">
          <h3>Saved Delivery Address</h3>
          {lastAddress ? (
            <div className="address-text">
              <div><strong>{lastAddress.full_name}</strong> — {lastAddress.phone}</div>
              <div>{lastAddress.street}, {lastAddress.city} - {lastAddress.pincode}</div>
            </div>
          ) : (
            <div className="address-empty">No address saved yet</div>
          )}
        </div>
      </div>

      <div className="profile-section-grid">
        {/* Order History */}
        <div className="profile-card">
          <h3>Order History</h3>

          {loading ? (
            <div className="order-loading"><Loader2 /> Loading orders...</div>
          ) : error ? (
            <div className="order-error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="order-empty">No orders yet</div>
          ) : (
            <div className="order-list">
              {orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-item-header">
                    <div>
                      <div className="order-id">Order #{String(order.id).slice(-8)}</div>
                      <div className="order-date">{formatDate(order.created_at)}</div>
                    </div>
                    <div className={statusClasses(order.status)}>{order.status}</div>
                  </div>

                  <div className="order-items">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="order-line">
                        <div>{it.name} x {it.quantity}</div>
                        <div>₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
                    <div>
                      <button onClick={() => reorder(order)} className="reorder-btn">Reorder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg && <div className="order-msg">{msg}</div>}
        </div>

        {/* Monthly Summary */}
        <div className="profile-card">
          <h3>Monthly Spend (last 3 months)</h3>
          {months.length === 0 ? (
            <div className="summary-empty">No data</div>
          ) : (
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {months.map(m => (
                  <tr key={m.month}>
                    <td>{formatMonthYear(m.month + '-01')}</td>
                    <td>{m.orders}</td>
                    <td>₹{m.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}