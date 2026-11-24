import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

type Product = {
  id: number | string
  name: string
  category: string
  price: number
  oldPrice?: number
  image: string
  badge?: string
  rating: number
  stock: number
}

type CartItem = Product & { quantity: number }

type Order = {
  id: string
  customer: string
  total: number
  status: 'Pendiente' | 'Procesando' | 'Completado'
  date: string
  items: number
}

type SupabaseOrder = {
  id: string
  customer: string
  total: number
  status: Order['status']
  date: string
  items: number
  created_at?: string
}

const initialProducts: Product[] = [
  { id: 1, name: 'MacBook Pro M3', category: 'Laptops', price: 8999000, oldPrice: 9499000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85', badge: 'Más vendido', rating: 5, stock: 12 },
  { id: 2, name: 'AirPods Pro', category: 'Audio', price: 1299000, oldPrice: 1499000, image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?auto=format&fit=crop&w=900&q=85', badge: 'Oferta', rating: 5, stock: 24 },
  { id: 3, name: 'Apple Watch Series 9', category: 'Wearables', price: 1999000, image: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?auto=format&fit=crop&w=900&q=85', rating: 4, stock: 8 },
  { id: 4, name: 'iPhone 15 Pro', category: 'Celulares', price: 4999000, oldPrice: 5299000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85', badge: 'Nuevo', rating: 5, stock: 15 },
  { id: 5, name: 'Sony WH-1000XM5', category: 'Audio', price: 1599000, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=85', rating: 5, stock: 19 },
  { id: 6, name: 'Samsung Galaxy S24', category: 'Celulares', price: 3999000, oldPrice: 4299000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=85', badge: 'Popular', rating: 4, stock: 10 },
]

const initialOrders: Order[] = [
  { id: '#1048', customer: 'Camila Rojas', total: 2298000, status: 'Pendiente', date: 'Hoy, 10:32', items: 2 },
  { id: '#1047', customer: 'Andrés Pérez', total: 8999000, status: 'Procesando', date: 'Hoy, 09:15', items: 1 },
  { id: '#1046', customer: 'Valentina Ruiz', total: 2898000, status: 'Completado', date: 'Ayer, 18:40', items: 3 },
]

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

function App() {
  const [view, setView] = useState<'store' | 'admin'>('store')
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('techstore-products')
    return saved ? JSON.parse(saved) : initialProducts
  })
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('techstore-cart')
    return saved ? JSON.parse(saved) : []
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products')

  useEffect(() => {
    localStorage.setItem('techstore-products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('techstore-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!supabase) return
    supabase.from('products').select('*').then(({ data }) => {
      if (data?.length) setProducts(data)
    })
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('No se pudieron cargar los pedidos:', error.message)
          return
        }
        if (data) {
          setOrders(data.map((row: SupabaseOrder) => ({
            id: row.id,
            customer: row.customer,
            total: Number(row.total),
            status: row.status,
            date: row.created_at
              ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.created_at))
              : row.date,
            items: Number(row.items),
          })))
        }
      })
  }, [])

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))]
  const filteredProducts = useMemo(() => products.filter((product) =>
    (category === 'Todos' || product.category === category) &&
    product.name.toLowerCase().includes(search.toLowerCase())
  ), [products, category, search])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => String(item.id) === String(product.id))
      if (found) return current.map((item) => String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const changeQuantity = (id: number | string, amount: number) => {
    setCart((current) => current
      .map((item) => String(item.id) === String(id) ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0))
  }

  const checkout = async () => {
    if (!cart.length) return
    const orderId = `#${Date.now().toString().slice(-6)}`
    const order: Order = {
      id: orderId,
      customer: 'Cliente de tienda',
      total: cartTotal,
      status: 'Pendiente',
      date: 'Ahora',
      items: cartCount,
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer: order.customer,
          total: cartTotal,
          status: order.status,
          date: order.date,
          items: cartCount,
          cart_items: cart,
        })
        .select()
        .single()

      if (error) {
        console.error('No se pudo guardar el pedido:', error.message)
        window.alert(`No se pudo guardar el pedido en Supabase: ${error.message}`)
        return
      }

      if (data) {
        setOrders((current) => [{
          id: data.id,
          customer: data.customer,
          total: Number(data.total),
          status: data.status,
          date: 'Ahora',
          items: Number(data.items),
        }, ...current.filter((currentOrder) => currentOrder.id !== data.id)])
      }
    } else {
      setOrders((current) => [order, ...current])
    }

    setCart([])
    setCartOpen(false)
  }

  return (
    <div className="app">
      {view === 'store' ? (
        <>
          <header className="header">
            <button className="icon-button menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú"><Menu /></button>
            <button className="brand" onClick={() => setView('store')} aria-label="Ir al inicio">
              <span className="brand-mark"><ShoppingBag /></span>
              <span><strong>Tech</strong>Nova</span>
            </button>
            <nav className={mobileOpen ? 'nav open' : 'nav'}>
              <button onClick={() => setMobileOpen(false)}>Inicio</button>
              <button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Productos <ChevronDown /></button>
              <button onClick={() => setView('admin')}>Administración</button>
            </nav>
            <div className="header-actions">
              <label className="search">
                <Search />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar productos..." />
              </label>
              <button className="icon-button" aria-label="Cuenta"><UserRound /></button>
              <button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
                <ShoppingCart /><span>{cartCount}</span>
              </button>
            </div>
          </header>

          <main>
            <section className="hero-section">
              <div className="hero-copy">
                <span className="eyebrow">TECNOLOGÍA QUE IMPULSA TU VIDA</span>
                <h1>Innovación a tu alcance</h1>
                <p>Descubre lo último en tecnología con los mejores productos, garantías y precios del mercado.</p>
                <button className="primary-button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Ver productos</button>
              </div>
              <div className="hero-image">
                <div className="promo-card">
                  <small>Hasta</small>
                  <strong>30% OFF</strong>
                  <span>en tecnología</span>
                </div>
                <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1100&q=90" alt="Laptop moderna sobre escritorio" />
              </div>
            </section>

            <section className="catalog" id="catalogo">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">NUESTROS FAVORITOS</span>
                  <h2>Productos destacados</h2>
                </div>
                <button className="text-button" onClick={() => setCategory('Todos')}>Ver todos</button>
              </div>
              <div className="category-list">
                {categories.map((item) => (
                  <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
                ))}
              </div>
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.badge && <span className="badge">{product.badge}</span>}
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <span className="category">{product.category}</span>
                      <h3>{product.name}</h3>
                      <div className="rating" aria-label={`${product.rating} estrellas`}>
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} fill={star <= product.rating ? 'currentColor' : 'none'} />)}
                      </div>
                      <div className="price-row">
                        <div><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
                        <button onClick={() => addToCart(product)} aria-label={`Agregar ${product.name} al carrito`}><ShoppingBag /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <footer>
            <div className="brand footer-brand"><span className="brand-mark"><ShoppingBag /></span><span><strong>Tech</strong>Nova</span></div>
            <p>Tu tienda tecnológica de confianza.</p>
            <span>© 2026 TechNova</span>
          </footer>
        </>
      ) : (
        <AdminView
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onStore={() => setView('store')}
        />
      )}

      {cartOpen && (
        <>
          <button className="overlay" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" />
          <aside className="cart-panel">
            <div className="cart-header"><div><span>Tu carrito</span><h2>{cartCount} productos</h2></div><button onClick={() => setCartOpen(false)} aria-label="Cerrar"><X /></button></div>
            <div className="cart-items">
              {cart.length === 0 ? <div className="empty-cart"><ShoppingCart /><h3>Tu carrito está vacío</h3><p>Agrega productos para comenzar tu compra.</p></div> :
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-info"><h3>{item.name}</h3><strong>{formatPrice(item.price)}</strong><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div>
                    <button className="remove" onClick={() => setCart((current) => current.filter((currentItem) => String(currentItem.id) !== String(item.id)))} aria-label={`Eliminar ${item.name}`}><Trash2 /></button>
                  </div>
                ))}
            </div>
            {cart.length > 0 && <div className="cart-footer"><div><span>Total</span><strong>{formatPrice(cartTotal)}</strong></div><button onClick={checkout}>Finalizar pedido</button></div>}
          </aside>
        </>
      )}
    </div>
  )
}

function AdminView({
  products, setProducts, orders, setOrders, adminTab, setAdminTab, onStore,
}: {
  products: Product[]
  setProducts: (products: Product[]) => void
  orders: Order[]
  setOrders: (orders: Order[]) => void
  adminTab: 'products' | 'orders'
  setAdminTab: (tab: 'products' | 'orders') => void
  onStore: () => void
}) {
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const openNew = () => {
    setEditing({ id: Date.now(), name: '', category: 'Celulares', price: 0, image: '', rating: 5, stock: 1 })
    setFormOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    const exists = products.some((product) => String(product.id) === String(editing.id))
    const next = exists ? products.map((product) => String(product.id) === String(editing.id) ? editing : product) : [editing, ...products]
    setProducts(next)
    if (supabase) {
      await supabase.from('products').upsert(editing)
    }
    setFormOpen(false)
  }

  const deleteProduct = async (id: number | string) => {
    setProducts(products.filter((product) => String(product.id) !== String(id)))
    if (supabase) await supabase.from('products').delete().eq('id', id)
  }

  const updateStatus = async (id: string, status: Order['status']) => {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) {
        console.error('No se pudo actualizar el pedido:', error.message)
        window.alert(`No se pudo actualizar el pedido: ${error.message}`)
        return
      }
    }
    setOrders(orders.map((order) => order.id === id ? { ...order, status } : order))
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <button className="brand" onClick={onStore}><span className="brand-mark"><ShoppingBag /></span><span><strong>Tech</strong>Nova</span></button>
        <nav>
          <button className={adminTab === 'products' ? 'active' : ''} onClick={() => setAdminTab('products')}><ShoppingBag /> Productos</button>
          <button className={adminTab === 'orders' ? 'active' : ''} onClick={() => setAdminTab('orders')}><ShoppingCart /> Pedidos <span>{orders.filter((order) => order.status === 'Pendiente').length}</span></button>
        </nav>
        <button className="back-store" onClick={onStore}>← Volver a la tienda</button>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><div><span>Panel de control</span><h1>{adminTab === 'products' ? 'Productos' : 'Pedidos'}</h1></div><button className="profile"><span>AR</span><div><strong>Admin</strong><small>Administrador</small></div><ChevronDown /></button></header>
        {adminTab === 'products' ? (
          <section className="admin-content">
            <div className="admin-toolbar"><div><h2>Catálogo</h2><p>{products.length} productos registrados</p></div><button className="primary-button" onClick={openNew}>+ Nuevo producto</button></div>
            <div className="table-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="table-product"><img src={product.image} alt="" /><strong>{product.name}</strong></div></td><td>{product.category}</td><td>{formatPrice(product.price)}</td><td><span className={product.stock < 10 ? 'stock low' : 'stock'}>{product.stock} unidades</span></td><td><button className="table-action" onClick={() => { setEditing(product); setFormOpen(true) }}>Editar</button><button className="table-action delete" onClick={() => deleteProduct(product.id)}><Trash2 /></button></td></tr>)}</tbody></table></div>
          </section>
        ) : (
          <section className="admin-content">
            <div className="admin-toolbar"><div><h2>Pedidos recientes</h2><p>{orders.length} pedidos totales</p></div></div>
            <div className="orders-grid">{orders.map((order) => <article className="order-card" key={order.id}><div><span>{order.id}</span><strong>{order.customer}</strong></div><p>{order.items} artículos · {order.date}</p><strong className="order-total">{formatPrice(order.total)}</strong><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as Order['status'])}><option>Pendiente</option><option>Procesando</option><option>Completado</option></select></article>)}</div>
          </section>
        )}
      </main>

      {formOpen && editing && (
        <div className="modal-backdrop"><form className="product-modal" onSubmit={handleSubmit}><div className="modal-header"><h2>{products.some((product) => product.id === editing.id && product.name) ? 'Editar producto' : 'Nuevo producto'}</h2><button type="button" onClick={() => setFormOpen(false)}><X /></button></div><label>Nombre<input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label><div className="form-row"><label>Categoría<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}><option>Celulares</option><option>Laptops</option><option>Audio</option><option>Wearables</option><option>Accesorios</option></select></label><label>Precio<input required type="number" min="0" value={editing.price} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} /></label></div><label>URL de imagen<input required value={editing.image} onChange={(event) => setEditing({ ...editing, image: event.target.value })} placeholder="https://..." /></label><label>Stock<input required type="number" min="0" value={editing.stock} onChange={(event) => setEditing({ ...editing, stock: Number(event.target.value) })} /></label><button className="primary-button" type="submit">Guardar producto</button></form></div>
      )}
    </div>
  )
}

export default App
