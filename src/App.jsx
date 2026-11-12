import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleUserRound,
  Clock3,
  LogOut,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import api from "./api.js";

const initialProducts = [
  {
    id: 1,
    nombre: "Sourdough rústico",
    categoria: "Panes",
    detalle: "Harina de campo · 24 h de fermentación",
    precio: 5900,
    stock: 12,
    imagen: "/images/sourdough.svg",
    tag: "El favorito",
  },
  {
    id: 2,
    nombre: "Baguette de masa madre",
    categoria: "Panes",
    detalle: "Corteza fina · miga aireada",
    precio: 3200,
    stock: 8,
    imagen: "/images/baguette.svg",
  },
  {
    id: 3,
    nombre: "Pan de centeno",
    categoria: "Panes",
    detalle: "Centeno integral · semillas tostadas",
    precio: 6400,
    stock: 5,
    imagen: "/images/rye.svg",
  },
  {
    id: 4,
    nombre: "Croissant de mantequilla",
    categoria: "Pasteles",
    detalle: "Mantequilla francesa · laminado a mano",
    precio: 2500,
    stock: 14,
    imagen: "/images/croissant.svg",
    tag: "Recién horneado",
  },
  {
    id: 5,
    nombre: "Roll de canela",
    categoria: "Pasteles",
    detalle: "Canela de Ceylán · glaseado cítrico",
    precio: 2900,
    stock: 0,
    imagen: "/images/cinnamon-roll.svg",
  },
  {
    id: 6,
    nombre: "Focaccia de temporada",
    categoria: "Panes",
    detalle: "Aceite de oliva · romero fresco",
    precio: 5200,
    stock: 6,
    imagen: "/images/focaccia.svg",
  },
];

const recentOrders = [
  { id: "#CS-1048", cliente: "Camila Rojas", total: 11800, estado: "Entregado" },
  { id: "#CS-1047", cliente: "Matías Silva", total: 8400, estado: "En preparación" },
  { id: "#CS-1046", cliente: "Josefina Paz", total: 5900, estado: "Confirmado" },
];

const money = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Ir al catálogo">
      <span className="brand-mark">c.</span>
      <span className="brand-name">cestino</span>
    </button>
  );
}

function Header({ view, cartCount, onNavigate, onOpenCart }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand onClick={() => onNavigate("catalog")} />
        <nav className="main-nav" aria-label="Navegación principal">
          <button
            className={view === "catalog" ? "nav-link active" : "nav-link"}
            onClick={() => onNavigate("catalog")}
          >
            Catálogo
          </button>
        </nav>
        <button className="cart-trigger" onClick={onOpenCart} aria-label={`Abrir carrito, ${cartCount} productos`}>
          <ShoppingBag size={19} strokeWidth={1.7} />
          <span className="cart-label">Carrito</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

function ProductCard({ product, onAdd }) {
  const outOfStock = product.stock === 0;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img className="product-image" src={product.imagen} alt={product.nombre} />
        {product.tag && <span className="product-tag">{product.tag}</span>}
        {outOfStock && <span className="stock-label">Sin stock</span>}
      </div>
      <div className="product-info">
        <div className="product-heading">
          <div>
            <span className="eyebrow">{product.categoria}</span>
            <h3>{product.nombre}</h3>
          </div>
          <span className="product-price">{money(product.precio)}</span>
        </div>
        <p className="product-detail">{product.detalle}</p>
        <button
          className="add-button"
          disabled={outOfStock}
          onClick={() => onAdd(product)}
        >
          {outOfStock ? "Agotado por hoy" : "Añadir al carrito"}
          {!outOfStock && <Plus size={16} />}
        </button>
      </div>
    </article>
  );
}

function Catalog({ products, onAdd, loading, error, onRetry }) {
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", "Panes", "Pasteles"];
  const filteredProducts =
    category === "Todos"
      ? products
      : products.filter((product) => product.categoria === category);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><span /> Panadería artesanal · Santiago</span>
          <h1>Hecho con tiempo.<br /><em>Disfrutado sin prisa.</em></h1>
          <p>Pan de masa madre y pastelería de estación, elaborados cada día con ingredientes honestos.</p>
          <a className="text-link" href="#catalogo">
            Explorar la carta <ArrowRight size={17} />
          </a>
        </div>
        <div className="hero-photo">
          <img
            src="/images/bakery-hero.svg"
            alt="Pan artesanal recién horneado"
          />
          <div className="hero-note"><span>01</span><span>La paciencia también<br />es un ingrediente.</span></div>
        </div>
        <span className="hero-index">Masa madre / 2024</span>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Nuestra selección</span>
            <h2>Del horno a tu mesa</h2>
          </div>
          <p>Pequeños lotes, ingredientes de temporada y mucho cuidado en cada detalle.</p>
        </div>
        <div className="catalog-toolbar">
          <div className="filter-group" aria-label="Filtrar por categoría">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "filter-button selected" : "filter-button"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="result-count">
            {loading ? "Cargando..." : `${filteredProducts.length} productos`}
          </span>
        </div>
        {loading ? (
          <p className="catalog-status" role="status">Cargando productos...</p>
        ) : error ? (
          <div className="catalog-status catalog-error" role="alert">
            <p>{error}</p>
            <button className="outline-button small-outline" onClick={onRetry}>Reintentar</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="catalog-status">No hay productos disponibles en esta categoría.</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        )}
      </section>

      <section className="promise-strip">
        <div><span className="promise-number">01</span><span>Fermentación lenta<br />y natural</span></div>
        <div><span className="promise-number">02</span><span>Ingredientes reales,<br />de origen local</span></div>
        <div><span className="promise-number">03</span><span>Horneado fresco<br />cada mañana</span></div>
      </section>
    </main>
  );
}

function CartDrawer({ open, cart, products, onClose, onChangeQuantity, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <>
      {open && <button className="drawer-backdrop" onClick={onClose} aria-label="Cerrar carrito" />}
      <aside className={open ? "cart-drawer open" : "cart-drawer"} aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Tu selección</span>
            <h2>Carrito <span>({cart.reduce((sum, item) => sum + item.cantidad, 0)})</span></h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar carrito"><X size={21} /></button>
        </div>
        <div className="drawer-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={30} strokeWidth={1.3} />
              <h3>Tu carrito está vacío</h3>
              <p>Un buen pan puede ser el comienzo de algo.</p>
              <button className="outline-button" onClick={onClose}>Explorar catálogo</button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const product = products.find((entry) => entry.id === item.id);
                  return (
                    <div className="cart-item" key={item.id}>
                      <img src={item.imagen} alt="" />
                      <div className="cart-item-main">
                        <div className="cart-item-top">
                          <div><h3>{item.nombre}</h3><span>{money(item.precio)}</span></div>
                          <button className="remove-button" onClick={() => onRemove(item.id)} aria-label={`Eliminar ${item.nombre}`}><Trash2 size={16} /></button>
                        </div>
                        <div className="quantity-control">
                          <button onClick={() => onChangeQuantity(item.id, -1)} aria-label="Disminuir cantidad"><Minus size={13} /></button>
                          <span>{item.cantidad}</span>
                          <button
                            onClick={() => onChangeQuantity(item.id, 1)}
                            disabled={!product || item.cantidad >= product.stock}
                            aria-label="Aumentar cantidad"
                          ><Plus size={13} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                <div><span>Envío</span><span className="muted">Se calcula al confirmar</span></div>
                <p>Los pedidos se preparan frescos para ti.</p>
                <button className="primary-button full-button" onClick={onCheckout}>
                  Proceder al pago <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function Checkout({ cart, onBack, onPayment }) {
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const [form, setForm] = useState({ nombre: "", direccion: "", correo: "" });
  const [errors, setErrors] = useState({});

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresa tu nombre.";
    if (!form.direccion.trim()) nextErrors.direccion = "Ingresa una dirección de entrega.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) nextErrors.correo = "Ingresa un correo válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onPayment(form);
  };

  return (
    <main className="checkout-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Volver al carrito</button>
      <div className="checkout-title">
        <span className="eyebrow">Un último paso</span>
        <h1>Finaliza tu pedido</h1>
        <p>Déjanos tus datos y nos ocupamos del resto.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <section className="form-section">
            <div className="form-section-title"><span>01</span><h2>Datos de entrega</h2></div>
            <label className="field">
              <span>Nombre completo</span>
              <input name="nombre" value={form.nombre} onChange={update} placeholder="Tu nombre y apellido" autoComplete="name" />
              {errors.nombre && <small>{errors.nombre}</small>}
            </label>
            <label className="field">
              <span>Dirección</span>
              <input name="direccion" value={form.direccion} onChange={update} placeholder="Calle, número, comuna" autoComplete="street-address" />
              {errors.direccion && <small>{errors.direccion}</small>}
            </label>
            <label className="field">
              <span>Correo electrónico</span>
              <input name="correo" type="email" value={form.correo} onChange={update} placeholder="tu@correo.com" autoComplete="email" />
              {errors.correo && <small>{errors.correo}</small>}
            </label>
          </section>
          <section className="form-section payment-section">
            <div className="form-section-title"><span>02</span><h2>Pago</h2></div>
            <div className="payment-note"><Check size={17} /><span>Pago seguro de demostración</span><span className="payment-method">Simulación</span></div>
          </section>
          <button type="submit" className="primary-button full-button">Simular pago <ArrowRight size={17} /></button>
          <p className="secure-caption">No se realizará ningún cobro real.</p>
        </form>
        <aside className="order-summary">
          <span className="eyebrow">Resumen del pedido</span>
          <h2>Tu selección</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div className="summary-item" key={item.id}>
                <div className="summary-thumb"><img src={item.imagen} alt="" /><span>{item.cantidad}</span></div>
                <span>{item.nombre}</span>
                <strong>{money(item.precio * item.cantidad)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
          <p className="delivery-note"><Clock3 size={15} /> Preparado fresco para entrega</p>
        </aside>
      </div>
    </main>
  );
}

function Admin({ products, onUpdateStock, onLogout }) {
  const [section, setSection] = useState("Inventario");
  const [draftStocks, setDraftStocks] = useState(() =>
    Object.fromEntries(products.map((product) => [product.id, String(product.stock)])),
  );
  const [savedId, setSavedId] = useState(null);
  const [stockErrors, setStockErrors] = useState({});

  const saveStock = (product) => {
    const parsedStock = Number(draftStocks[product.id]);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setStockErrors({ ...stockErrors, [product.id]: "Ingresa un stock entero igual o mayor que 0." });
      return;
    }
    setStockErrors({ ...stockErrors, [product.id]: "" });
    onUpdateStock(product.id, parsedStock);
    setSavedId(product.id);
    window.setTimeout(() => setSavedId((current) => (current === product.id ? null : current)), 1800);
  };

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Espacio de gestión</span>
          <h1>Panel de administración</h1>
          <p>Gestiona el día a día de Cestino.</p>
        </div>
        <div className="admin-actions">
          <div className="admin-user"><CircleUserRound size={18} /><span>Administrador</span></div>
          <button className="outline-button small-outline" onClick={onLogout}><LogOut size={14} /> Cerrar sesión</button>
        </div>
      </div>
      <div className="admin-tabs">
        {["Inventario", "Órdenes"].map((item) => (
          <button key={item} className={section === item ? "admin-tab active" : "admin-tab"} onClick={() => setSection(item)}>
            {item}<span>{item === "Inventario" ? products.length : recentOrders.length}</span>
          </button>
        ))}
      </div>
      {section === "Inventario" ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <div><h2>Inventario</h2><p>Actualiza la disponibilidad de cada producto.</p></div>
            <span className="live-indicator"><span /> Sincronizado</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock disponible</th><th></th></tr></thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td><div className="table-product"><img src={product.imagen} alt="" /><strong>{product.nombre}</strong></div></td>
                    <td><span className="category-pill">{product.categoria}</span></td>
                    <td>{money(product.precio)}</td>
                    <td>
                      <input
                        className="stock-input"
                        type="number"
                        min="0"
                        step="1"
                        aria-label={`Stock de ${product.nombre}`}
                        aria-invalid={Boolean(stockErrors[product.id])}
                        value={draftStocks[product.id] ?? product.stock}
                        onChange={(event) => {
                          setDraftStocks({ ...draftStocks, [product.id]: event.target.value });
                          setStockErrors({ ...stockErrors, [product.id]: "" });
                        }}
                      />
                    </td>
                    <td>
                      <button className="save-button" onClick={() => saveStock(product)}>{savedId === product.id ? <><Check size={14} /> Guardado</> : "Guardar"}</button>
                      {stockErrors[product.id] && <span className="stock-error">{stockErrors[product.id]}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="admin-panel">
          <div className="panel-heading">
            <div><h2>Órdenes recientes</h2><p>Un vistazo a los pedidos de tu tienda.</p></div>
            <button className="outline-button small-outline">Ver todas <ArrowRight size={14} /></button>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.cliente}</td>
                    <td>{["Hoy, 10:42", "Hoy, 09:18", "Ayer, 16:35"][index]}</td>
                    <td>{money(order.total)}</td>
                    <td><span className={`order-status status-${index}`}>{order.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="admin-footnote"><span>Última actualización</span><span>Hoy, 10:42</span></div>
    </main>
  );
}

function PaymentOverlay() {
  return (
    <div className="payment-overlay" role="status" aria-live="polite">
      <div className="payment-card">
        <span className="payment-spinner" aria-hidden="true" />
        <span className="eyebrow">Cestino · Masa madre</span>
        <h2>Procesando tu pago</h2>
        <p>Estamos preparando la confirmación de tu pedido.</p>
        <span className="redirect-caption">Esto tomará solo un momento.</span>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [catalogReload, setCatalogReload] = useState(0);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("catalog");
  const [cartOpen, setCartOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError("");
      try {
        const response = await api.get("/api/productos", { signal: controller.signal });
        if (active) setProducts(response.data);
      } catch (error) {
        if (active) {
          setProductsError(
            error.response?.data?.message || "No se pudo cargar el catálogo. Inténtalo nuevamente.",
          );
        }
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
      controller.abort();
    };
  }, [catalogReload]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.cantidad, 0),
    [cart],
  );

  const addToCart = (product) => {
    if (product.stock < 1) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= product.stock) return current;
        return current.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      }
      return [...current, { ...product, cantidad: 1 }];
    });
    setNotice(`${product.nombre} añadido al carrito`);
    window.setTimeout(() => setNotice(""), 2300);
  };

  const changeQuantity = (id, amount) => {
    const product = products.find((item) => item.id === id);
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const cantidad = Math.min(product?.stock ?? 0, item.cantidad + amount);
          return { ...item, cantidad };
        })
        .filter((item) => item.cantidad > 0),
    );
  };

  const updateStock = (id, stock) => {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, stock } : product));
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, cantidad: Math.min(item.cantidad, stock) } : item)
      .filter((item) => item.cantidad > 0));
  };

  const startPayment = () => {
    setCartOpen(false);
    setPaying(true);
    window.setTimeout(() => {
      setCart([]);
      setPaying(false);
      setView("catalog");
      setNotice("Pago exitoso, pedido confirmado");
      window.setTimeout(() => setNotice(""), 4000);
    }, 2000);
  };

  const navigate = () => {
    setView("catalog");
    setNotice("");
  };

  return (
    <div className="app">
      <div className="announcement"><span>Horneamos cada mañana en Santiago</span><span>Pedidos hasta las 18:00 <ArrowRight size={13} /></span></div>
      <Header view={view} cartCount={cartCount} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
      {view === "catalog" && (
        <Catalog
          products={products}
          onAdd={addToCart}
          loading={productsLoading}
          error={productsError}
          onRetry={() => setCatalogReload((current) => current + 1)}
        />
      )}
      {view === "checkout" && <Checkout cart={cart} onBack={() => { setView("catalog"); setCartOpen(true); }} onPayment={startPayment} />}
      <footer className="site-footer">
        <Brand onClick={() => navigate("catalog")} />
        <span>Pan hecho con tiempo, desde 2018.</span>
        <span>© Cestino Masa Madre</span>
      </footer>
      <CartDrawer
        open={cartOpen}
        cart={cart}
        products={products}
        onClose={() => setCartOpen(false)}
        onChangeQuantity={changeQuantity}
        onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))}
        onCheckout={() => { setCartOpen(false); setView("checkout"); }}
      />
      {notice && !paying && <div className="toast"><Check size={16} />{notice}</div>}
      {paying && <PaymentOverlay />}
    </div>
  );
}

const tokenStorageKey = "cestino_admin_token";

function AdminLogin({ onLogin, error, submitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="eyebrow">Acceso restringido</span>
        <h1>Administración</h1>
        <p>Inicia sesión con las credenciales autorizadas para continuar.</p>
        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button className="primary-button full-button" type="submit" disabled={submitting}>
          {submitting ? "Validando..." : "Iniciar sesión"}
        </button>
        <a className="admin-back-link" href="/">Volver a la tienda</a>
      </form>
    </main>
  );
}

export function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey));
  const [authenticated, setAuthenticated] = useState(false);
  const [validating, setValidating] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    if (!token) {
      setAuthenticated(false);
      setValidating(false);
      return undefined;
    }

    let active = true;
    let expirationTimer;
    setValidating(true);
    api.get("/api/admin/session")
      .then((result) => {
        if (active) {
          setAuthenticated(true);
          setError("");
          expirationTimer = window.setTimeout(() => {
            localStorage.removeItem(tokenStorageKey);
            setToken(null);
            setAuthenticated(false);
            setError("La sesión expiró. Inicia sesión nuevamente.");
          }, Math.max(result.data.user.expiresAt - Date.now(), 0));
        }
      })
      .catch((requestError) => {
        if (active) {
          localStorage.removeItem(tokenStorageKey);
          setToken(null);
          setAuthenticated(false);
          setError(
            requestError.response?.data?.message ||
              "No se pudo validar la sesión. Inicia sesión nuevamente.",
          );
        }
      })
      .finally(() => {
        if (active) setValidating(false);
      });

    return () => {
      active = false;
      window.clearTimeout(expirationTimer);
    };
  }, [token]);

  const login = async (email, password) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post("/api/auth/login", { email, password });
      localStorage.setItem(tokenStorageKey, response.data.token);
      setToken(response.data.token);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo conectar con el servidor.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setAuthenticated(false);
    setError("");
  };

  const updateStock = (id, stock) => {
    setProducts((current) =>
      current.map((product) => product.id === id ? { ...product, stock } : product),
    );
  };

  if (validating) {
    return <main className="admin-login-page" role="status">Validando acceso...</main>;
  }

  if (!authenticated) {
    return <AdminLogin onLogin={login} error={error} submitting={submitting} />;
  }

  return <Admin products={products} onUpdateStock={updateStock} onLogout={logout} />;
}

export default App;
