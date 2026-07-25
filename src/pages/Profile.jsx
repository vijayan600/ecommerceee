import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, adminGetDashboard, adminGetAllOrders, adminUpdateOrderStatus, getAllProducts, addProduct, updateProduct, deleteProduct, adminGetCustomers } from '../api/services.js'
import { Loader2, User, Home, ShoppingCart, Box, Users, LogOut, Menu, X, ArrowUp, ArrowDown } from 'lucide-react'
import './Profile.css'
import './AdminDashboard.css'

/* ─── helpers ────────────────────────────────────────── */
function formatMonthYear(d) { try { return new Date(d).toLocaleString(undefined,{month:'short',year:'numeric'}) } catch { return '' } }
function formatDate(d)      { try { return new Date(d).toLocaleString() } catch { return '' } }
function formatINR(val)     { return '₹' + (Number(val)||0).toLocaleString('en-IN') }

function NavIcon({ name }) {
  switch(name) {
    case 'dashboard': return <Home size={18}/>;
    case 'orders':    return <ShoppingCart size={18}/>;
    case 'products':  return <Box size={18}/>;
    case 'customers': return <Users size={18}/>;
    default:          return null;
  }
}

/* ─── static fallback data ───────────────────────────── */
const staticDash = {
  todays_orders:7, todays_revenue:'12400', weekly_revenue:'68500',
  monthly_revenue:'245000', weekly_percent_change:12,
  top_products:[{name:'Granite Wet Grinder',count:42},{name:'Stainless Steel Bowl',count:31},{name:'Turbo Mixer 750W',count:24},{name:'Compact Juicer Pro',count:18},{name:'Premium Blender 1L',count:11}],
  low_stock:[{name:'Granite Wet Grinder',stock:2},{name:'Turbo Mixer 750W',stock:4}],
};
const staticOrders=[
  {id:'ORD-1001',delivery_address:{full_name:'Anita Patel'},items:[{name:'Granite Wet Grinder',quantity:1}],total_amount:7500,created_at:new Date().toISOString(),status:'pending'},
  {id:'ORD-1002',delivery_address:{full_name:'Rohit Singh'},items:[{name:'Stainless Steel Bowl',quantity:2}],total_amount:2300,created_at:new Date().toISOString(),status:'confirmed'},
  {id:'ORD-1003',delivery_address:{full_name:'Meena Krishnan'},items:[{name:'Turbo Mixer 750W',quantity:1}],total_amount:4200,created_at:new Date(Date.now()-3600000).toISOString(),status:'out_for_delivery'},
  {id:'ORD-1004',delivery_address:{full_name:'Suresh Kumar'},items:[{name:'Premium Blender 1L',quantity:1}],total_amount:3800,created_at:new Date(Date.now()-7200000).toISOString(),status:'delivered'},
];
const staticProducts=[
  {id:1,name:'Granite Wet Grinder 2L',image:'https://placehold.co/60x60/1a1a2e/FFD700?text=GG',price:7500,stock:2,available:true,note:'Best seller'},
  {id:2,name:'Stainless Steel Bowl 5L',image:'https://placehold.co/60x60/1a1a2e/FFD700?text=SB',price:1200,stock:14,available:true,note:''},
  {id:3,name:'Turbo Mixer 750W',image:'https://placehold.co/60x60/1a1a2e/FFD700?text=TM',price:4200,stock:4,available:true,note:'Low stock'},
  {id:4,name:'Compact Juicer Pro',image:'https://placehold.co/60x60/1a1a2e/FFD700?text=CJ',price:2800,stock:9,available:true,note:''},
];
const staticCustomers=[
  {id:1,name:'Anita Patel',email:'anita.patel@gmail.com',phone:'9876543210',total_orders:5,total_spent:38000},
  {id:2,name:'Meena Krishnan',email:'meena.k@gmail.com',phone:'9988776655',total_orders:8,total_spent:62000},
  {id:3,name:'Rohit Singh',email:'rohit.singh@gmail.com',phone:'9123456789',total_orders:3,total_spent:15000},
  {id:4,name:'Suresh Kumar',email:'suresh.k@yahoo.com',phone:'9871234560',total_orders:2,total_spent:8200},
];

const navItems = [
  {key:'dashboard',label:'Dashboard'},
  {key:'orders',   label:'Orders'},
  {key:'products', label:'Products'},
  {key:'customers',label:'Customers'},
];

/* ════════════════════════════════════════════════════════
   ADMIN DASHBOARD (shown when user.role === 'admin')
   ════════════════════════════════════════════════════════ */
function AdminDashboard({ user, logout }) {
  const [active, setActive]           = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dash, setDash]               = useState(staticDash);
  const [orders, setOrders]           = useState(staticOrders);
  const [orderFilter, setOrderFilter] = useState('');
  const [products, setProducts]       = useState(staticProducts);
  const [customers, setCustomers]     = useState(staticCustomers);
  const [showAdd, setShowAdd]         = useState(false);
  const [addData, setAddData]         = useState({name:'',image:'',price:'',stock:'',note:''});
  const [editingId, setEditingId]     = useState(null);
  const [editingData, setEditingData] = useState({});
  const ordersInterval = useRef(null);

  const loadDashboard = useCallback(async () => {
    try { const r = await adminGetDashboard(); if(r?.todays_orders) setDash(r); } catch {}
  },[]);
  const loadOrders = useCallback(async (status) => {
    try { const r = await adminGetAllOrders(status); const l=Array.isArray(r)?r:r?.orders||[]; if(l.length) setOrders(l); } catch {}
  },[]);
  const loadProducts = useCallback(async () => {
    try { const r = await getAllProducts(); const l=Array.isArray(r)?r:r?.products||[]; if(l.length) setProducts(l); } catch {}
  },[]);
  const loadCustomers = useCallback(async () => {
    try { const r = await adminGetCustomers(); const l=r?.customers||[]; if(l.length) setCustomers(l); } catch {}
  },[]);

  useEffect(() => { loadDashboard(); loadOrders(); loadProducts(); loadCustomers(); },[]);
  useEffect(() => {
    if(active==='orders') ordersInterval.current = setInterval(()=>loadOrders(orderFilter),8000);
    else clearInterval(ordersInterval.current);
    return ()=>clearInterval(ordersInterval.current);
  },[active,orderFilter]);

  const displayOrders = orderFilter ? orders.filter(o=>o.status===orderFilter) : orders;

  return (
    <div className="admin-dashboard" style={{position:'fixed',inset:0,zIndex:9999,overflowY:'auto'}}>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={()=>setSidebarOpen(true)}><Menu size={22}/></button>
        <div className="brand">Suguna Admin</div>
        <button className="logout-btn" onClick={logout}><LogOut size={20}/></button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen?'open':''}`}>
        <div className="brand">Suguna</div>
        <div style={{padding:'0.5rem 1rem',marginBottom:'0.5rem',fontSize:'0.75rem',color:'#666',borderBottom:'1px solid #2a2a2a',paddingBottom:'1rem'}}>
          <div style={{color:'#aaa',fontSize:'0.8rem'}}>Logged in as</div>
          <div style={{color:'#d4af37',fontWeight:600,fontSize:'0.82rem',marginTop:'2px',wordBreak:'break-all'}}>{user?.email}</div>
        </div>
        <nav>
          {navItems.map(item=>(
            <button key={item.key} className={`nav-item ${active===item.key?'active':''}`}
              onClick={()=>{setActive(item.key);setSidebarOpen(false);}}>
              <NavIcon name={item.key}/><span>{item.label}</span>
            </button>
          ))}
          <button className="nav-item logout" onClick={logout} style={{marginTop:'auto'}}>
            <LogOut size={18}/><span>Logout</span>
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={()=>setSidebarOpen(false)}/>}

      {/* Mobile Bottom Tabs */}
      <nav className="mobile-tabs">
        {navItems.map(item=>(
          <button key={item.key} className={`tab-item ${active===item.key?'active':''}`} onClick={()=>setActive(item.key)}>
            <NavIcon name={item.key}/><span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="content">

        {/* ── DASHBOARD ── */}
        {active==='dashboard' && (
          <section className="section">
            <h1 className="section-title">Dashboard Overview</h1>
            <div className="stat-grid">
              {[{label:"Today's Orders",value:dash.todays_orders??0},{label:"Today's Revenue",value:formatINR(dash.todays_revenue)},{label:'Weekly Revenue',value:formatINR(dash.weekly_revenue)},{label:'Monthly Revenue',value:formatINR(dash.monthly_revenue)}]
                .map(({label,value})=>(
                  <div key={label} className="stat-card">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value}</div>
                  </div>
                ))}
            </div>
            <div className="two-col">
              <div className="card">
                <div className="card-header">
                  <h2>This Week vs Last Week</h2>
                  <div className="pct-change">
                    {(dash.weekly_percent_change??0)>=0?<ArrowUp className="text-success"/>:<ArrowDown className="text-danger"/>}
                    <span className={(dash.weekly_percent_change??0)>=0?'text-success':'text-danger'}>{Math.abs(dash.weekly_percent_change??0)}%</span>
                  </div>
                </div>
                <div className="mini-chart">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i)=>{
                    const h=[45,62,38,75,55,88,68];
                    return <div key={day} className="bar-col"><div className="bar" style={{height:`${h[i]}%`}}/><span className="bar-label">{day}</span></div>;
                  })}
                </div>
              </div>
              <div className="card">
                <h2>Top 5 Products</h2>
                <ol className="top-list">
                  {(dash.top_products||[]).slice(0,5).map((p,i)=>(
                    <li key={i}><span className="rank">#{i+1}</span><span className="pname">{p.name}</span><span className="count">{p.count} sold</span></li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="card low-stock">
              <h2>Low Stock Alerts</h2>
              {dash.low_stock?.length?(
                <ul>{dash.low_stock.map((p,i)=>(
                  <li key={i} className="low-item"><span className="dot"/><span>{p.name}</span><span className="stock-badge">{p.stock} left</span></li>
                ))}</ul>
              ):<p className="no-alerts">All stocks are healthy.</p>}
            </div>
          </section>
        )}

        {/* ── ORDERS ── */}
        {active==='orders' && (
          <section className="section">
            <div className="section-header">
              <h1 className="section-title">Orders</h1>
              <span className="order-count-badge">{displayOrders.length} orders</span>
            </div>
            <div className="filter-bar">
              {['','pending','confirmed','out_for_delivery','delivered'].map(s=>(
                <button key={s} className={`filter-btn ${orderFilter===s?'selected':''}`}
                  onClick={()=>{setOrderFilter(s);loadOrders(s);}}>
                  {s===''?'All':s.replace(/_/g,' ')}
                </button>
              ))}
            </div>
            <div className="table-wrapper">
              <table className="orders-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>
                  {displayOrders.map(o=>(
                    <tr key={o.id}>
                      <td className="order-id-cell">#{String(o.id).slice(-6)}</td>
                      <td className="customer-cell">{o.delivery_address?.full_name||'—'}</td>
                      <td className="items-cell">
                        <div className="items-list">
                          {(o.items||[]).map((it,idx)=><span key={idx} className="item-chip">{it.name} <span className="item-qty">×{it.quantity}</span></span>)}
                        </div>
                      </td>
                      <td className="total-cell">{formatINR(o.total_amount)}</td>
                      <td className="date-cell">{new Date(o.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                      <td><span className={`status-badge status-${o.status}`}>{o.status.replace(/_/g,' ')}</span></td>
                      <td>
                        <select defaultValue={o.status} onChange={e=>adminUpdateOrderStatus(o.id,e.target.value).then(()=>loadOrders(orderFilter)).catch(()=>{})}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── PRODUCTS ── */}
        {active==='products' && (
          <section className="section">
            <div className="section-header">
              <h1 className="section-title">Products</h1>
              <button className="add-btn" onClick={()=>setShowAdd(s=>!s)}>{showAdd?'Cancel':'+ Add Product'}</button>
            </div>
            {showAdd&&(
              <form className="add-form" onSubmit={async e=>{e.preventDefault();try{await addProduct({name:addData.name,image:addData.image,price:Number(addData.price),stock:Number(addData.stock),note:addData.note});setAddData({name:'',image:'',price:'',stock:'',note:''});setShowAdd(false);await loadProducts();}catch{}}}>
                <div className="add-form-grid">
                  <input required placeholder="Product Name" value={addData.name}  onChange={e=>setAddData({...addData,name:e.target.value})}/>
                  <input          placeholder="Image URL"    value={addData.image} onChange={e=>setAddData({...addData,image:e.target.value})}/>
                  <input required placeholder="Price (₹)"   type="number" min="0" value={addData.price}  onChange={e=>setAddData({...addData,price:e.target.value})}/>
                  <input required placeholder="Stock"       type="number" min="0" value={addData.stock}  onChange={e=>setAddData({...addData,stock:e.target.value})}/>
                  <input          placeholder="Note"        value={addData.note}  onChange={e=>setAddData({...addData,note:e.target.value})}/>
                  <button type="submit" className="save-btn">Save Product</button>
                </div>
              </form>
            )}
            <div className="table-wrapper">
              <table className="products-table">
                <thead><tr><th>Image</th><th>Product Name</th><th>Price</th><th>Stock</th><th>Note</th><th>Available</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p=>(
                    <tr key={p.id} className={p.stock<=3?'low-stock-row':''}>
                      <td><img src={p.image} alt={p.name} className="thumb"/></td>
                      <td className="product-name-cell">
                        {editingId===p.id?<input value={editingData.name} onChange={e=>setEditingData({...editingData,name:e.target.value})}/>:<span>{p.name}</span>}
                        {p.note&&editingId!==p.id&&<span className="product-note">{p.note}</span>}
                      </td>
                      <td className="price-cell">{editingId===p.id?<input value={editingData.price} onChange={e=>setEditingData({...editingData,price:e.target.value})} className="price-input"/>:formatINR(p.price)}</td>
                      <td>{editingId===p.id?<input value={editingData.stock} onChange={e=>setEditingData({...editingData,stock:e.target.value})} className="stock-input"/>:<span className={`stock-num ${p.stock<=3?'stock-danger':p.stock<=6?'stock-warn':'stock-ok'}`}>{p.stock}</span>}</td>
                      <td className="note-cell">{editingId===p.id?<input value={editingData.note||''} onChange={e=>setEditingData({...editingData,note:e.target.value})} placeholder="Note…"/>:<span className="note-text">{p.note||'—'}</span>}</td>
                      <td><input type="checkbox" className="avail-check" checked={p.available??true} onChange={async e=>{await updateProduct(p.id,{available:e.target.checked});await loadProducts();}}/></td>
                      <td>
                        {editingId===p.id?(
                          <div className="action-btns">
                            <button className="save-action" onClick={async()=>{try{await updateProduct(p.id,{name:editingData.name,image:editingData.image,price:Number(editingData.price),stock:Number(editingData.stock),note:editingData.note});setEditingId(null);setEditingData({});await loadProducts();}catch{}}}>Save</button>
                            <button className="cancel-action" onClick={()=>{setEditingId(null);setEditingData({});}}>Cancel</button>
                          </div>
                        ):(
                          <div className="action-btns">
                            <button className="edit-action" onClick={()=>{setEditingId(p.id);setEditingData({name:p.name,image:p.image,price:p.price,stock:p.stock,note:p.note});}}>Edit</button>
                            <button className="delete-action" onClick={async()=>{if(!window.confirm('Delete?'))return;try{await deleteProduct(p.id);await loadProducts();}catch{}}}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── CUSTOMERS ── */}
        {active==='customers' && (
          <section className="section">
            <div className="section-header">
              <h1 className="section-title">Customers</h1>
              <span className="order-count-badge">{customers.length} customers</span>
            </div>
            <div className="table-wrapper">
              <table className="customers-table">
                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th></tr></thead>
                <tbody>
                  {customers.map((c,i)=>(
                    <tr key={c.id} className={i===0?'top-customer':''}>
                      <td className="rank-cell">{i+1}</td>
                      <td className="customer-name-cell">{c.name}{i===0&&<span className="vip-badge">⭐ Top</span>}</td>
                      <td className="email-cell">{c.email}</td>
                      <td>{c.phone}</td>
                      <td className="orders-cell">{c.total_orders||0}</td>
                      <td className="spent-cell">{formatINR(c.total_spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   REGULAR USER PROFILE
   ════════════════════════════════════════════════════════ */
function UserProfile({ user, logout }) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders]   = useState([])
  const [error, setError]     = useState(null)
  const [msg, setMsg]         = useState(null)

  useEffect(()=>{
    let mounted=true
    async function load(){
      setLoading(true); setError(null)
      try { const res=await getMyOrders(); if(mounted) setOrders(res?.orders||[]) }
      catch(err){ setError(err?.message||'Failed to load orders') }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return()=>{mounted=false}
  },[])

  const totalSpent   = orders.reduce((s,o)=>s+(Number(o.total_amount)||0),0)
  const lastAddress  = orders.length>0?orders[0].delivery_address:null

  function statusClasses(s){
    const m={pending:'order-status status-pending',confirmed:'order-status status-confirmed',out_for_delivery:'order-status status-out_for_delivery',delivered:'order-status status-delivered'}
    return m[s]||'order-status status-default'
  }

  function reorder(order){
    try{
      const existing=JSON.parse(localStorage.getItem('cart')||'[]')
      const items=order.items.map(it=>({product_id:it.product_id,name:it.name,price:it.price,quantity:it.quantity,image:it.image}))
      const map=new Map(); existing.forEach(it=>map.set(it.product_id,{...it}))
      items.forEach(it=>{const cur=map.get(it.product_id);if(cur)cur.quantity=Number(cur.quantity||0)+Number(it.quantity||0);else map.set(it.product_id,{...it})})
      localStorage.setItem('cart',JSON.stringify(Array.from(map.values())))
      setMsg('Added to cart!'); setTimeout(()=>setMsg(null),2000)
    }catch{ setMsg('Failed'); setTimeout(()=>setMsg(null),2000) }
  }

  const groups=orders.reduce((acc,o)=>{
    const d=new Date(o.created_at); if(isNaN(d))return acc
    const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')
    if(!acc[key])acc[key]={month:key,orders:0,total:0}
    acc[key].orders+=1; acc[key].total+=Number(o.total_amount)||0; return acc
  },{})
  const months=Object.values(groups).sort((a,b)=>b.month.localeCompare(a.month)).slice(0,3)

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar"><User size={40}/></div>
            <div>
              <div className="profile-name">{user.name||'—'}</div>
              <div className="profile-meta">{user.email}</div>
              <div className="profile-meta">{user.phone||'—'}</div>
            </div>
          </div>
          <div className="profile-stats">
            <div><strong>Member since:</strong> {user.created_at?formatMonthYear(user.created_at):'—'}</div>
            <div className="spacer"><strong>Total spent:</strong> ₹{totalSpent.toFixed(2)}</div>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
        <div className="profile-card span-2">
          <h3>Saved Delivery Address</h3>
          {lastAddress?(
            <div className="address-text">
              <div><strong>{lastAddress.full_name}</strong> — {lastAddress.phone}</div>
              <div>{lastAddress.street}, {lastAddress.city} - {lastAddress.pincode}</div>
            </div>
          ):<div className="address-empty">No address saved yet</div>}
        </div>
      </div>
      <div className="profile-section-grid">
        <div className="profile-card">
          <h3>Order History</h3>
          {loading?<div className="order-loading"><Loader2/> Loading orders...</div>
           :error?<div className="order-error">{error}</div>
           :orders.length===0?<div className="order-empty">No orders yet</div>:(
            <div className="order-list">
              {orders.map(order=>(
                <div key={order.id} className="order-item">
                  <div className="order-item-header">
                    <div>
                      <div className="order-id">Order #{String(order.id).slice(-8)}</div>
                      <div className="order-date">{formatDate(order.created_at)}</div>
                    </div>
                    <div className={statusClasses(order.status)}>{order.status}</div>
                  </div>
                  <div className="order-items">
                    {order.items?.map((it,idx)=>(
                      <div key={idx} className="order-line"><div>{it.name} x {it.quantity}</div><div>₹{(Number(it.price)*Number(it.quantity)).toFixed(2)}</div></div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <div className="order-total">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
                    <button onClick={()=>reorder(order)} className="reorder-btn">Reorder</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {msg&&<div className="order-msg">{msg}</div>}
        </div>
        <div className="profile-card">
          <h3>Monthly Spend (last 3 months)</h3>
          {months.length===0?<div className="summary-empty">No data</div>:(
            <table className="summary-table">
              <thead><tr><th>Month</th><th>Orders</th><th>Total Spent</th></tr></thead>
              <tbody>{months.map(m=><tr key={m.month}><td>{formatMonthYear(m.month+'-01')}</td><td>{m.orders}</td><td>₹{m.total.toFixed(2)}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   ROOT EXPORT — routes admin vs user
   ════════════════════════════════════════════════════════ */
export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) return (
    <div className="profile-login-prompt">
      <div className="card">Please <a href="/login">login</a></div>
    </div>
  )

  if (user.role === 'admin') {
    return <AdminDashboard user={user} logout={logout}/>
  }

  return <UserProfile user={user} logout={logout}/>
}