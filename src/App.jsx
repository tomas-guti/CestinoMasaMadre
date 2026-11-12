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

const metropolitanCommunes = [
  "Alhué",
  "Buin",
  "Calera de Tango",
  "Cerrillos",
  "Cerro Navia",
  "Colina",
  "Conchalí",
  "Curacaví",
  "El Bosque",
  "El Monte",
  "Estación Central",
  "Huechuraba",
  "Independencia",
  "Isla de Maipo",
  "La Cisterna",
  "La Florida",
  "La Granja",
  "La Pintana",
  "La Reina",
  "Lampa",
  "Las Condes",
  "Lo Barnechea",
  "Lo Espejo",
  "Lo Prado",
  "Macul",
  "Maipú",
  "María Pinto",
  "Melipilla",
  "Ñuñoa",
  "Padre Hurtado",
  "Paine",
  "Pedro Aguirre Cerda",
  "Peñaflor",
  "Peñalolén",
  "Pirque",
  "Providencia",
  "Pudahuel",
  "Puente Alto",
  "Quilicura",
  "Quinta Normal",
  "Recoleta",
  "Renca",
  "San Bernardo",
  "San Joaquín",
  "San José de Maipo",
  "San Miguel",
  "San Pedro",
  "San Ramón",
  "Santiago",
  "Talagante",
  "Tiltil",
  "Vitacura",
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
        <p className="product-stock">{product.stock} disponibles</p>
        <button
          className="add-button"
          disabled={outOfStock}
          onClick={() => onAdd(product)}
        >
          {outOfStock ? "Agotado" : "Agregar al carrito"}
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

function Checkout({
  cart,
  onBack,
  onPayment,
  paying,
  pendingOrderId,
  onResumePayment,
}) {
  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    calle: "",
    numero: "",
    comuna: "",
  });
  const [errors, setErrors] = useState({});

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresa tu nombre.";
    if (!form.calle.trim()) nextErrors.calle = "Ingresa una calle.";
    if (!form.numero.trim()) nextErrors.numero = "Ingresa un número.";
    if (!metropolitanCommunes.includes(form.comuna)) {
      nextErrors.comuna = "Selecciona una comuna de la Región Metropolitana.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Ingresa un correo válido.";
    if (!form.telefono.trim()) nextErrors.telefono = "Ingresa un teléfono de contacto.";
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
              <input name="nombre" value={form.nombre} onChange={update} placeholder="Tu nombre y apellido" autoComplete="name" maxLength={100} required />
              {errors.nombre && <small>{errors.nombre}</small>}
            </label>
            <label className="field">
              <span>Correo electrónico</span>
              <input name="email" type="email" value={form.email} onChange={update} placeholder="tu@correo.com" autoComplete="email" maxLength={100} required />
              {errors.email && <small>{errors.email}</small>}
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input name="telefono" type="tel" value={form.telefono} onChange={update} placeholder="+56 9 1234 5678" autoComplete="tel" maxLength={30} required />
              {errors.telefono && <small>{errors.telefono}</small>}
            </label>
            <label className="field">
              <span>Calle</span>
              <input name="calle" value={form.calle} onChange={update} placeholder="Nombre de la calle" autoComplete="address-line1" maxLength={150} required />
              {errors.calle && <small>{errors.calle}</small>}
            </label>
            <label className="field">
              <span>Número</span>
              <input name="numero" value={form.numero} onChange={update} placeholder="Número y departamento" maxLength={30} required />
              {errors.numero && <small>{errors.numero}</small>}
            </label>
            <label className="field">
              <span>Comuna</span>
              <select name="comuna" value={form.comuna} onChange={update} autoComplete="address-level2" required>
                <option value="">Selecciona una comuna</option>
                {metropolitanCommunes.map((comuna) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
              {errors.comuna && <small>{errors.comuna}</small>}
            </label>
          </section>
          <section className="form-section payment-section">
            <div className="form-section-title"><span>02</span><h2>Pago</h2></div>
            <div className="payment-note"><Check size={17} /><span>Pago seguro de demostración</span><span className="payment-method">Simulación</span></div>
          </section>
          {pendingOrderId ? (
            <div className="pending-payment-actions">
              <p>Pedido #{pendingOrderId} pendiente de pago.</p>
              <button type="button" className="primary-button full-button" onClick={onResumePayment}>
                Reanudar simulación de pago <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <button type="submit" className="primary-button full-button" disabled={paying}>
              {paying ? "Creando pedido..." : "Continuar"}
              {!paying && <ArrowRight size={17} />}
            </button>
          )}
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

const emptyProduct = {
  nombre: "",
  categoria: "",
  detalle: "",
  precio: "",
  stock: "0",
  imagen: "",
  tag: "",
};
const orderStatuses = ["Pendiente", "Preparando", "Listo", "Entregado"];

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function Admin({ onLogout }) {
  const [section, setSection] = useState("Productos");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [productReload, setProductReload] = useState(0);
  const [orderReload, setOrderReload] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [formError, setFormError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState({});

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
            error.response?.data?.message || "No se pudieron cargar los productos.",
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
  }, [productReload]);

  useEffect(() => {
    if (section !== "Pedidos") return undefined;

    const controller = new AbortController();
    let active = true;
    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const response = await api.get("/api/pedidos/admin", { signal: controller.signal });
        if (active) setOrders(response.data);
      } catch (error) {
        if (active) {
          setOrdersError(error.response?.data?.message || "No se pudieron cargar los pedidos.");
        }
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
      controller.abort();
    };
  }, [section, orderReload]);

  const openNewProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setFormError("");
    setProductFormOpen(true);
  };

  const openEditProductForm = (product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
    setProductForm({
      nombre: product.nombre ?? "",
      categoria: product.categoria ?? "",
      detalle: product.detalle ?? "",
      precio: String(product.precio),
      stock: String(product.stock),
      imagen: product.imagen ?? "",
      tag: product.tag ?? "",
    });
    setFormError("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const precio = Number(productForm.precio);
    const stock = Number(productForm.stock);
    if (
      !Number.isSafeInteger(precio) ||
      precio < 0 ||
      precio > 2147483647 ||
      !Number.isSafeInteger(stock) ||
      stock < 0 ||
      stock > 2147483647
    ) {
      setFormError("Precio y stock deben ser enteros entre 0 y 2.147.483.647.");
      return;
    }

    if (!productForm.nombre.trim()) {
      setFormError("El nombre del producto es obligatorio.");
      return;
    }

    const payload = {
      nombre: productForm.nombre.trim(),
      categoria: productForm.categoria.trim() || null,
      detalle: productForm.detalle.trim() || null,
      precio,
      stock,
      imagen: productForm.imagen.trim() || null,
      tag: productForm.tag.trim() || null,
    };

    setSavingProduct(true);
    setFormError("");
    try {
      if (editingProduct) {
        const response = await api.put(`/api/productos/${editingProduct.id}`, payload);
        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id ? response.data : product,
          ),
        );
      } else {
        const response = await api.post("/api/productos", payload);
        setProducts((current) => [response.data, ...current]);
      }
      setEditingProduct(null);
      setProductFormOpen(false);
    } catch (error) {
      setFormError(
        error.response?.data?.message || "No se pudo guardar el producto.",
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.nombre}"?`)) return;
    setProductsError("");
    try {
      await api.delete(`/api/productos/${product.id}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) {
      setProductsError(
        error.response?.data?.message || "No se pudo eliminar el producto.",
      );
    }
  };

  const updateOrderStatus = async (order, estado) => {
    const previousStatus = order.estado;
    setOrdersError("");
    setUpdatingOrders((current) => ({ ...current, [order.id_pedido]: true }));
    setOrders((current) =>
      current.map((item) =>
        item.id_pedido === order.id_pedido ? { ...item, estado } : item,
      ),
    );
    try {
      await api.put(`/api/pedidos/${order.id_pedido}/estado`, { estado });
    } catch (error) {
      setOrders((current) =>
        current.map((item) =>
          item.id_pedido === order.id_pedido
            ? { ...item, estado: previousStatus }
            : item,
        ),
      );
      setOrdersError(
        error.response?.data?.message || "No se pudo actualizar el estado del pedido.",
      );
    } finally {
      setUpdatingOrders((current) => ({ ...current, [order.id_pedido]: false }));
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Espacio de gestión</span>
          <h1>Panel de administración</h1>
          <p>Gestiona productos y pedidos de Cestino.</p>
        </div>
        <div className="admin-actions">
          <div className="admin-user"><CircleUserRound size={18} /><span>Administrador</span></div>
          <button className="outline-button small-outline" onClick={onLogout}><LogOut size={14} /> Cerrar sesión</button>
        </div>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Secciones de administración">
        {["Productos", "Pedidos"].map((item) => (
          <button
            key={item}
            id={`admin-tab-${item.toLowerCase()}`}
            className={section === item ? "admin-tab active" : "admin-tab"}
            role="tab"
            aria-selected={section === item}
            aria-controls={`admin-panel-${item.toLowerCase()}`}
            onClick={() => setSection(item)}
          >
            {item}<span>{item === "Productos" ? products.length : orders.length}</span>
          </button>
        ))}
      </div>
      {section === "Productos" ? (
        <section
          className="admin-panel"
          id="admin-panel-productos"
          role="tabpanel"
          aria-labelledby="admin-tab-productos"
        >
          <div className="panel-heading">
            <div><h2>Productos</h2><p>Administra precios, inventario y catálogo.</p></div>
            <div className="admin-panel-actions">
              <button className="outline-button small-outline" onClick={() => setProductReload((current) => current + 1)}>
                Actualizar
              </button>
              <button className="primary-button admin-new-button" onClick={openNewProductForm}>
                <Plus size={15} /> Nuevo Producto
              </button>
            </div>
          </div>
          {productsError && <p className="admin-error" role="alert">{productsError}</p>}
          {productsLoading ? (
            <p className="admin-empty" role="status">Cargando productos...</p>
          ) : products.length === 0 && !productsError ? (
            <p className="admin-empty">Aún no hay productos. Crea el primero.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td><div className="table-product"><img src={product.imagen || "/images/sourdough.svg"} alt="" /><strong>{product.nombre}</strong></div></td>
                      <td>{product.categoria || "—"}</td>
                      <td>{money(product.precio)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="product-actions">
                          <button className="save-button" onClick={() => openEditProductForm(product)}>Editar</button>
                          <button className="delete-button" onClick={() => deleteProduct(product)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section
          className="admin-panel"
          id="admin-panel-pedidos"
          role="tabpanel"
          aria-labelledby="admin-tab-pedidos"
        >
          <div className="panel-heading">
            <div><h2>Pedidos</h2><p>Consulta ventas y actualiza su estado.</p></div>
            <button className="outline-button small-outline" onClick={() => setOrderReload((current) => current + 1)}>
              Actualizar
            </button>
          </div>
          {ordersError && <p className="admin-error" role="alert">{ordersError}</p>}
          {ordersLoading ? (
            <p className="admin-empty" role="status">Cargando pedidos...</p>
          ) : orders.length === 0 && !ordersError ? (
            <p className="admin-empty">No hay pedidos registrados.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Pedido</th><th>Nombre</th><th>Email</th><th>Calle</th><th>Número</th><th>Comuna</th><th>Teléfono</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
                <tbody>
                  {orders.map((order) => {
                    const statuses = orderStatuses.includes(order.estado)
                      ? orderStatuses
                      : [order.estado, ...orderStatuses];
                    return (
                      <tr key={order.id_pedido}>
                        <td><strong>#{order.id_pedido}</strong></td>
                        <td>{order.nombre_cliente}</td>
                        <td>{order.email}</td>
                        <td>{order.calle}</td>
                        <td>{order.numero}</td>
                        <td>{order.comuna}</td>
                        <td>{order.telefono}</td>
                        <td>{formatOrderDate(order.fecha)}</td>
                        <td>{money(order.total)}</td>
                        <td>
                          <select
                            className="status-select"
                            aria-label={`Estado del pedido ${order.id_pedido}`}
                            value={order.estado}
                            disabled={Boolean(updatingOrders[order.id_pedido])}
                            onChange={(event) => updateOrderStatus(order, event.target.value)}
                          >
                            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      <div className="admin-footnote"><span>Sesión protegida</span><span>Administración</span></div>
      {productFormOpen && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingProduct) setProductFormOpen(false);
        }}>
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
            <div className="admin-modal-heading">
              <div>
                <span className="eyebrow">{editingProduct ? "Editar catálogo" : "Nuevo registro"}</span>
                <h2 id="product-form-title">{editingProduct ? "Editar producto" : "Nuevo producto"}</h2>
              </div>
              <button className="icon-button" aria-label="Cerrar formulario" disabled={savingProduct} onClick={() => setProductFormOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <form className="product-form" onSubmit={saveProduct}>
              <label className="field"><span>Nombre</span><input required maxLength={100} value={productForm.nombre} onChange={(event) => setProductForm({ ...productForm, nombre: event.target.value })} /></label>
              <div className="product-form-row">
                <label className="field"><span>Categoría</span><input maxLength={50} value={productForm.categoria} onChange={(event) => setProductForm({ ...productForm, categoria: event.target.value })} /></label>
                <label className="field"><span>Precio (CLP)</span><input type="number" min="0" max="2147483647" step="1" required value={productForm.precio} onChange={(event) => setProductForm({ ...productForm, precio: event.target.value })} /></label>
              </div>
              <div className="product-form-row">
                <label className="field"><span>Stock</span><input type="number" min="0" max="2147483647" step="1" required value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label>
                <label className="field"><span>Etiqueta</span><input maxLength={50} value={productForm.tag} onChange={(event) => setProductForm({ ...productForm, tag: event.target.value })} /></label>
              </div>
              <label className="field"><span>Descripción</span><textarea rows="3" value={productForm.detalle} onChange={(event) => setProductForm({ ...productForm, detalle: event.target.value })} /></label>
              <label className="field"><span>Ruta de imagen</span><input maxLength={255} value={productForm.imagen} onChange={(event) => setProductForm({ ...productForm, imagen: event.target.value })} placeholder="/images/producto.svg" /></label>
              {formError && <p className="admin-error" role="alert">{formError}</p>}
              <div className="product-form-actions">
                <button type="button" className="outline-button" disabled={savingProduct} onClick={() => setProductFormOpen(false)}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={savingProduct}>
                  {savingProduct ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function PaymentSimulationModal({
  orderId,
  total,
  confirming,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <div
      className="payment-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirming) onClose();
      }}
    >
      <section
        className="payment-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-simulation-title"
        aria-describedby="payment-simulation-description"
      >
        <button
          className="icon-button payment-close"
          type="button"
          aria-label="Cerrar simulación de pago"
          disabled={confirming}
          onClick={onClose}
        >
          <X size={17} />
        </button>
        <span className="eyebrow">Cestino · Masa madre</span>
        <h2 id="payment-simulation-title">Simulación de Pago</h2>
        <p id="payment-simulation-description">
          Pedido #{orderId} · Total {money(total)}. Confirma para completar el pedido.
        </p>
        {error && <p className="payment-error" role="alert">{error}</p>}
        <div className="payment-modal-actions">
          <button
            className="outline-button"
            type="button"
            disabled={confirming}
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? "Confirmando..." : "Confirmar Pago"}
          </button>
        </div>
      </section>
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
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);

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
    setNoticeIsError(false);
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

  const startPayment = async (customerDetails) => {
    const cliente = {
      nombre: customerDetails.nombre.trim(),
      email: customerDetails.email.trim(),
      telefono: customerDetails.telefono.trim(),
      calle: customerDetails.calle.trim(),
      numero: customerDetails.numero.trim(),
      comuna: customerDetails.comuna.trim(),
    };
    if (
      !cliente.nombre ||
      !cliente.email ||
      !cliente.telefono ||
      !cliente.calle ||
      !cliente.numero ||
      !metropolitanCommunes.includes(cliente.comuna) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)
    ) {
      setNotice("Completa todos los datos y selecciona una comuna de la Región Metropolitana.");
      setNoticeIsError(true);
      return;
    }

    const payload = {
      cliente,
      carrito: cart.map((item) => ({
        id_producto: item.id,
        cantidad: item.cantidad,
      })),
    };

    setPaying(true);
    setNotice("");
    setNoticeIsError(false);

    try {
      const response = await api.post("/api/pedidos", payload);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("El servidor no pudo crear el pedido.");
      }
      if (!Number.isSafeInteger(response.data.id_pedido) || response.data.id_pedido < 1) {
        throw new Error("El servidor no devolvió un identificador de pedido válido.");
      }

      const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      setPendingOrder({ id: response.data.id_pedido, total });
      setPaymentError("");
      setPaymentModalOpen(true);
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          error.message ||
          "No se pudo procesar el pedido. Inténtalo nuevamente.",
      );
      setNoticeIsError(true);
    } finally {
      setPaying(false);
    }
  };

  const confirmPayment = async () => {
    if (!pendingOrder) return;

    setConfirmingPayment(true);
    setPaymentError("");
    try {
      const response = await api.put(`/api/pedidos/${pendingOrder.id}/estado`, {
        estado: "Confirmado",
      });
      if (response.status !== 200) {
        throw new Error("El servidor no pudo confirmar el pago.");
      }

      setCart([]);
      setPendingOrder(null);
      setPaymentModalOpen(false);
      setView("catalog");
      setCatalogReload((current) => current + 1);
      setNotice("Pago confirmado correctamente.");
      setNoticeIsError(false);
      window.setTimeout(() => setNotice(""), 4000);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "No se pudo confirmar el pago. Inténtalo nuevamente.",
      );
    } finally {
      setConfirmingPayment(false);
    }
  };

  const closePaymentModal = () => {
    if (confirmingPayment) return;
    setPaymentModalOpen(false);
    setPaymentError("");
  };

  const resumePayment = () => {
    setPaymentError("");
    setPaymentModalOpen(true);
  };

  const navigate = () => {
    setView("catalog");
    setNotice("");
    setNoticeIsError(false);
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
      {view === "checkout" && (
        <Checkout
          cart={cart}
          onBack={() => { setView("catalog"); setCartOpen(true); }}
          onPayment={startPayment}
          paying={paying}
          pendingOrderId={pendingOrder?.id}
          onResumePayment={resumePayment}
        />
      )}
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
      {notice && !paying && (
        <div className={noticeIsError ? "toast toast-error" : "toast"} role={noticeIsError ? "alert" : "status"}>
          {noticeIsError ? <X size={16} /> : <Check size={16} />}
          {notice}
        </div>
      )}
      {paymentModalOpen && pendingOrder && (
        <PaymentSimulationModal
          orderId={pendingOrder.id}
          total={pendingOrder.total}
          confirming={confirmingPayment}
          error={paymentError}
          onConfirm={confirmPayment}
          onClose={closePaymentModal}
        />
      )}
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

  if (validating) {
    return <main className="admin-login-page" role="status">Validando acceso...</main>;
  }

  if (!authenticated) {
    return <AdminLogin onLogin={login} error={error} submitting={submitting} />;
  }

  return <Admin onLogout={logout} />;
}

export default App;
