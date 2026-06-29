import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../api/services.js'
import { Loader2, User } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow">Please <a href="/login" className="text-indigo-600">login</a></div>
    </div>
  )

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)

  const lastAddress = orders.length > 0 ? orders[0].delivery_address : null

  function statusClasses(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {/* placeholder avatar */}
              <User size={40} className="text-gray-400" />
            </div>
            <div>
              <div className="text-lg font-medium">{user.name || '—'}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-sm text-gray-600">{user.phone || '—'}</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            <div><strong>Member since:</strong> {user.created_at ? formatMonthYear(user.created_at) : '—'}</div>
            <div className="mt-2"><strong>Total spent:</strong> ₹{totalSpent.toFixed(2)}</div>
          </div>

          <button onClick={logout} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Logout</button>
        </div>

        {/* Saved Address */}
        <div className="bg-white p-6 rounded shadow md:col-span-2">
          <h3 className="text-lg font-medium mb-3">Saved Delivery Address</h3>
          {lastAddress ? (
            <div className="text-sm text-gray-700">
              <div><strong>{lastAddress.full_name}</strong> — {lastAddress.phone}</div>
              <div>{lastAddress.street}, {lastAddress.city} - {lastAddress.pincode}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No address saved yet</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order History */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">Order History</h3>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-600"><Loader2 className="animate-spin" /> Loading orders...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-600">No orders yet</div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-600">Order #{String(order.id).slice(-8)}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded ${statusClasses(order.status)}`}>{order.status}</div>
                  </div>

                  <div className="mt-3">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-700">
                        <div>{it.name} x {it.quantity}</div>
                        <div>₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-medium">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => reorder(order)} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Reorder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg && <div className="mt-3 text-green-600">{msg}</div>}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">Monthly Spend (last 3 months)</h3>
          {months.length === 0 ? (
            <div className="text-gray-600">No data</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-1">Month</th>
                  <th className="py-1">Orders</th>
                  <th className="py-1">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {months.map(m => (
                  <tr key={m.month} className="border-t">
                    <td className="py-2">{formatMonthYear(m.month + '-01')}</td>
                    <td className="py-2">{m.orders}</td>
                    <td className="py-2">₹{m.total.toFixed(2)}</td>
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
