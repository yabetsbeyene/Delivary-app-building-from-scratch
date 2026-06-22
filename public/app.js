const { useEffect, useMemo, useState } = React;

const API = "/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"
];

function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("delivery-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = session?.user;
  const token = session?.token;

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  };

  const flash = (message, type = "success") => {
    setNotice(type === "success" ? message : "");
    setError(type === "error" ? message : "");
    window.clearTimeout(window.__flashTimer);
    window.__flashTimer = window.setTimeout(() => {
      setNotice("");
      setError("");
    }, 4200);
  };

  const loadProducts = async () => {
    const data = await request("/products");
    setProducts(data);
  };

  const loadCart = async () => {
    if (!token) return setCart({ items: [] });
    const data = await request("/cart");
    setCart(data);
  };

  const loadOrders = async () => {
    if (!token) return setOrders([]);
    const data = await request("/orders");
    setOrders(data);
  };

  const loadStats = async () => {
    if (!token || user?.role !== "admin") return setStats(null);
    const data = await request("/admin/dashboard");
    setStats(data);
  };

  useEffect(() => {
    loadProducts().catch(error => flash(error.message, "error"));
  }, []);

  useEffect(() => {
    localStorage.setItem("delivery-session", JSON.stringify(session));
    loadCart().catch(error => flash(error.message, "error"));
    loadOrders().catch(error => flash(error.message, "error"));
    loadStats().catch(error => flash(error.message, "error"));
  }, [session]);

  const categories = useMemo(() => {
    const list = products.map(product => product.category).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const search = `${product.name} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const matchesQuery = search.includes(query.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const cartTotal = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => {
      return sum + ((item.product?.price || 0) * item.quantity);
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const login = async form => {
    setLoading(true);
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      const nextSession = { token: data.token, user: data.user };
      setSession(nextSession);
      setView("shop");
      flash(`Welcome back, ${data.user.name}`);
    } catch (error) {
      flash(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const register = async form => {
    setLoading(true);
    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      await login({ email: form.email, password: form.password });
    } catch (error) {
      flash(error.message, "error");
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("delivery-session");
    setView("shop");
    flash("You are signed out");
  };

  const addToCart = async product => {
    if (!token) {
      setView("shop");
      flash("Sign in as a customer to add items to your cart", "error");
      return;
    }
    try {
      const data = await request("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product._id, quantity: 1 })
      });
      setCart(data);
      flash(`${product.name} added to cart`);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    try {
      const data = await request(`/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity })
      });
      setCart(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const removeItem = async productId => {
    try {
      const data = await request(`/cart/${productId}`, {
        method: "DELETE"
      });
      setCart(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const placeOrder = async () => {
    try {
      await request("/orders", { method: "POST" });
      await loadCart();
      await loadOrders();
      setView("orders");
      flash("Order placed successfully");
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const createProduct = async form => {
    try {
      await request("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          isAvailable: true
        })
      });
      await loadProducts();
      setView("shop");
      flash("Product published");
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const deleteProduct = async id => {
    try {
      await request(`/products/${id}`, { method: "DELETE" });
      await loadProducts();
      flash("Product deleted");
    } catch (error) {
      flash(error.message, "error");
    }
  };

  return (
    React.createElement("div", { className: "app" },
      React.createElement(Topbar, {
        user,
        view,
        setView,
        logout,
        cartCount
      }),
      React.createElement("main", { className: "main" },
        notice && React.createElement("div", { className: "message" }, notice),
        error && React.createElement("div", { className: "message error" }, error),
        view === "shop" && React.createElement(ShopView, {
          user,
          products: filteredProducts,
          categories,
          query,
          setQuery,
          category,
          setCategory,
          addToCart,
          login,
          register,
          loading,
          setView
        }),
        view === "cart" && React.createElement(CartView, {
          cart,
          cartTotal,
          updateQuantity,
          removeItem,
          placeOrder,
          setView
        }),
        view === "merchant" && React.createElement(MerchantView, {
          products,
          user,
          createProduct,
          deleteProduct
        }),
        view === "orders" && React.createElement(OrdersView, {
          orders
        }),
        view === "admin" && React.createElement(AdminView, {
          stats,
          loadStats
        })
      )
    )
  );
}

function Topbar({ user, view, setView, logout, cartCount }) {
  const canMerchant = user?.role === "merchant";
  const canAdmin = user?.role === "admin";
  return (
    React.createElement("header", { className: "topbar" },
      React.createElement("div", { className: "brand" },
        React.createElement("span", { className: "brand-mark" }, "D"),
        React.createElement("span", null, "Delivery Hub")
      ),
      React.createElement("nav", { className: "tabs" },
        React.createElement(Tab, { active: view === "shop", onClick: () => setView("shop") }, "Shop"),
        React.createElement(Tab, { active: view === "cart", onClick: () => setView("cart") }, `Cart ${cartCount ? `(${cartCount})` : ""}`),
        React.createElement(Tab, { active: view === "orders", onClick: () => setView("orders") }, "Orders"),
        canMerchant && React.createElement(Tab, { active: view === "merchant", onClick: () => setView("merchant") }, "Merchant"),
        canAdmin && React.createElement(Tab, { active: view === "admin", onClick: () => setView("admin") }, "Admin")
      ),
      React.createElement("div", { className: "account" },
        user
          ? React.createElement(React.Fragment, null,
              React.createElement("span", { className: "avatar" }, initials(user.name)),
              React.createElement("div", null,
                React.createElement("strong", null, user.name),
                React.createElement("div", { className: "muted small" }, user.role)
              ),
              React.createElement("button", { className: "btn ghost", onClick: logout }, "Sign out")
            )
          : React.createElement("span", { className: "muted small" }, "Sign in to order, manage products, or view stats")
      )
    )
  );
}

function Tab({ active, children, onClick }) {
  return React.createElement("button", {
    className: `tab ${active ? "active" : ""}`,
    onClick
  }, children);
}

function ShopView(props) {
  const {
    user,
    products,
    categories,
    query,
    setQuery,
    category,
    setCategory,
    addToCart,
    login,
    register,
    loading,
    setView
  } = props;

  return (
    React.createElement(React.Fragment, null,
      React.createElement("section", { className: "hero" },
        React.createElement("div", { className: "hero-copy" },
          React.createElement("p", { className: "eyebrow" }, "Fresh orders, clean operations"),
          React.createElement("h1", null, "Delivery Hub"),
          React.createElement("p", null, "A polished storefront for customers, a simple product desk for merchants, and fast operational numbers for admins."),
          React.createElement("div", { className: "hero-actions" },
            React.createElement("button", { className: "btn", onClick: () => document.getElementById("products").scrollIntoView({ behavior: "smooth" }) }, "Browse menu"),
            React.createElement("button", { className: "btn secondary", onClick: () => setView(user ? "cart" : "shop") }, user ? "View cart" : "Create account")
          )
        ),
        user
          ? React.createElement("div", { className: "panel auth-panel" },
              React.createElement("p", { className: "eyebrow" }, "Session"),
              React.createElement("h2", null, `Hello, ${user.name}`),
              React.createElement("p", { className: "muted" }, "Your account is connected to the backend. Use the tabs above to move between shopping, cart, orders, and role tools."),
              React.createElement("button", { className: "btn full", onClick: () => setView("cart") }, "Open cart")
            )
          : React.createElement(AuthPanel, { login, register, loading })
      ),
      React.createElement("section", { id: "products" },
        React.createElement("div", { className: "section-head" },
          React.createElement("div", null,
            React.createElement("h2", null, "Available Products"),
            React.createElement("p", { className: "muted" }, "Search by product, description, or category.")
          ),
          React.createElement("div", { className: "toolbar" },
            React.createElement("input", {
              className: "input search",
              value: query,
              onChange: event => setQuery(event.target.value),
              placeholder: "Search products"
            }),
            React.createElement("select", {
              className: "select",
              value: category,
              onChange: event => setCategory(event.target.value)
            }, categories.map(item => React.createElement("option", { key: item, value: item }, titleCase(item))))
          )
        ),
        products.length
          ? React.createElement("div", { className: "grid" },
              products.map((product, index) => React.createElement(ProductCard, {
                key: product._id,
                product,
                image: product.image || fallbackImages[index % fallbackImages.length],
                addToCart
              }))
            )
          : React.createElement("div", { className: "empty" }, "No products match your filters yet.")
      )
    )
  );
}

function AuthPanel({ login, register, loading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer"
  });

  const update = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = event => {
    event.preventDefault();
    mode === "login"
      ? login({ email: form.email, password: form.password })
      : register(form);
  };

  return (
    React.createElement("div", { className: "panel auth-panel" },
      React.createElement("div", { className: "switcher" },
        React.createElement("button", { className: mode === "login" ? "active" : "", onClick: () => setMode("login") }, "Login"),
        React.createElement("button", { className: mode === "register" ? "active" : "", onClick: () => setMode("register") }, "Register")
      ),
      React.createElement("form", { className: "form", onSubmit: submit },
        mode === "register" && React.createElement(Field, { label: "Name", name: "name", value: form.name, onChange: update, required: true }),
        React.createElement(Field, { label: "Email", name: "email", type: "email", value: form.email, onChange: update, required: true }),
        React.createElement(Field, { label: "Password", name: "password", type: "password", value: form.password, onChange: update, required: true }),
        mode === "register" && React.createElement(Field, { label: "Phone", name: "phone", value: form.phone, onChange: update }),
        mode === "register" && React.createElement("div", { className: "field" },
          React.createElement("label", null, "Role"),
          React.createElement("select", { className: "select", name: "role", value: form.role, onChange: update },
            ["customer", "merchant", "driver", "admin"].map(role => React.createElement("option", { key: role, value: role }, titleCase(role)))
          )
        ),
        React.createElement("button", { className: "btn full", disabled: loading }, loading ? "Please wait" : mode === "login" ? "Login" : "Create account")
      )
    )
  );
}

function Field({ label, name, type = "text", value, onChange, required = false, placeholder = "" }) {
  return (
    React.createElement("div", { className: "field" },
      React.createElement("label", { htmlFor: name }, label),
      React.createElement("input", {
        id: name,
        className: "input",
        name,
        type,
        value,
        onChange,
        required,
        placeholder
      })
    )
  );
}

function ProductCard({ product, image, addToCart }) {
  return (
    React.createElement("article", { className: "product" },
      React.createElement("img", { className: "product-image", src: image, alt: product.name }),
      React.createElement("div", { className: "product-body" },
        React.createElement("div", { className: "product-title" },
          React.createElement("div", null,
            React.createElement("h3", null, product.name),
            React.createElement("span", { className: "badge" }, product.category || "General")
          ),
          React.createElement("span", { className: "price" }, money(product.price))
        ),
        React.createElement("p", { className: "muted" }, product.description || "Freshly listed and ready to order."),
        React.createElement("button", { className: "btn", onClick: () => addToCart(product) }, "Add to cart")
      )
    )
  );
}

function CartView({ cart, cartTotal, updateQuantity, removeItem, placeOrder, setView }) {
  const items = cart.items || [];
  return (
    React.createElement("section", { className: "split" },
      React.createElement("div", null,
        React.createElement("div", { className: "section-head" },
          React.createElement("div", null,
            React.createElement("h2", null, "Cart"),
            React.createElement("p", { className: "muted" }, "Review quantities before placing the order.")
          )
        ),
        items.length
          ? React.createElement("div", { className: "panel cart-list" },
              items.map(item => React.createElement(LineItem, {
                key: item.product?._id || item._id,
                item,
                updateQuantity,
                removeItem
              }))
            )
          : React.createElement("div", { className: "empty" }, "Your cart is empty.")
      ),
      React.createElement("aside", { className: "panel" },
        React.createElement("h2", null, "Summary"),
        React.createElement("p", { className: "muted" }, `${items.length} item group${items.length === 1 ? "" : "s"} in cart`),
        React.createElement("div", { className: "total" },
          React.createElement("span", null, "Total"),
          React.createElement("span", null, money(cartTotal))
        ),
        React.createElement("div", { className: "form", style: { marginTop: 16 } },
          React.createElement("button", { className: "btn full", disabled: !items.length, onClick: placeOrder }, "Place order"),
          React.createElement("button", { className: "btn secondary full", onClick: () => setView("shop") }, "Keep shopping")
        )
      )
    )
  );
}

function LineItem({ item, updateQuantity, removeItem }) {
  const product = item.product || {};
  const image = product.image || fallbackImages[0];
  return (
    React.createElement("div", { className: "line-item" },
      React.createElement("img", { className: "thumb", src: image, alt: product.name || "Product" }),
      React.createElement("div", null,
        React.createElement("strong", null, product.name || "Product"),
        React.createElement("div", { className: "muted small" }, money(product.price || 0))
      ),
      React.createElement("div", { className: "qty" },
        React.createElement("button", { onClick: () => updateQuantity(product._id, item.quantity - 1) }, "-"),
        React.createElement("strong", null, item.quantity),
        React.createElement("button", { onClick: () => updateQuantity(product._id, item.quantity + 1) }, "+"),
        React.createElement("button", { onClick: () => removeItem(product._id) }, "x")
      )
    )
  );
}

function MerchantView({ products, user, createProduct, deleteProduct }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: ""
  });

  const mine = products.filter(product => {
    const merchantId = product.merchant?._id || product.merchant;
    return merchantId === user?.id;
  });

  const update = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async event => {
    event.preventDefault();
    await createProduct(form);
    setForm({ name: "", description: "", price: "", category: "", image: "" });
  };

  if (user?.role !== "merchant") {
    return React.createElement("div", { className: "empty" }, "Login as a merchant to manage products.");
  }

  return (
    React.createElement("section", { className: "split" },
      React.createElement("div", null,
        React.createElement("div", { className: "section-head" },
          React.createElement("div", null,
            React.createElement("h2", null, "Merchant Desk"),
            React.createElement("p", { className: "muted" }, "Create products that appear instantly in the customer shop.")
          )
        ),
        React.createElement("div", { className: "grid" },
          mine.map((product, index) => React.createElement("article", { className: "product", key: product._id },
            React.createElement("img", { className: "product-image", src: product.image || fallbackImages[index % fallbackImages.length], alt: product.name }),
            React.createElement("div", { className: "product-body" },
              React.createElement("div", { className: "product-title" },
                React.createElement("h3", null, product.name),
                React.createElement("span", { className: "price" }, money(product.price))
              ),
              React.createElement("p", { className: "muted" }, product.description || "No description yet."),
              React.createElement("button", { className: "btn danger", onClick: () => deleteProduct(product._id) }, "Delete")
            )
          ))
        )
      ),
      React.createElement("aside", { className: "panel" },
        React.createElement("h2", null, "New Product"),
        React.createElement("form", { className: "form", onSubmit: submit },
          React.createElement(Field, { label: "Name", name: "name", value: form.name, onChange: update, required: true }),
          React.createElement(Field, { label: "Price", name: "price", type: "number", value: form.price, onChange: update, required: true }),
          React.createElement(Field, { label: "Category", name: "category", value: form.category, onChange: update, required: true }),
          React.createElement(Field, { label: "Image URL", name: "image", value: form.image, onChange: update, placeholder: "https://..." }),
          React.createElement("div", { className: "field" },
            React.createElement("label", null, "Description"),
            React.createElement("textarea", { className: "textarea", name: "description", value: form.description, onChange: update })
          ),
          React.createElement("button", { className: "btn full" }, "Publish product")
        )
      )
    )
  );
}

function OrdersView({ orders }) {
  return (
    React.createElement("section", null,
      React.createElement("div", { className: "section-head" },
        React.createElement("div", null,
          React.createElement("h2", null, "Orders"),
          React.createElement("p", { className: "muted" }, "Your recent checkout history.")
        )
      ),
      orders.length
        ? React.createElement("div", { className: "orders" },
            orders.map(order => React.createElement("article", { className: "order-card", key: order._id },
              React.createElement("div", { className: "order-top" },
                React.createElement("div", null,
                  React.createElement("strong", null, `Order ${order._id.slice(-6).toUpperCase()}`),
                  React.createElement("div", { className: "muted small" }, new Date(order.createdAt).toLocaleString())
                ),
                React.createElement("span", { className: "badge" }, titleCase(order.orderStatus || "placed"))
              ),
              React.createElement("p", { className: "muted" }, `${order.items?.length || 0} item group${order.items?.length === 1 ? "" : "s"}`),
              React.createElement("div", { className: "total" },
                React.createElement("span", null, "Total"),
                React.createElement("span", null, money(order.totalAmount || 0))
              )
            ))
          )
        : React.createElement("div", { className: "empty" }, "No orders yet.")
    )
  );
}

function AdminView({ stats, loadStats }) {
  return (
    React.createElement("section", null,
      React.createElement("div", { className: "section-head" },
        React.createElement("div", null,
          React.createElement("h2", null, "Admin Dashboard"),
          React.createElement("p", { className: "muted" }, "Live counts from users, products, and orders.")
        ),
        React.createElement("button", { className: "btn secondary", onClick: loadStats }, "Refresh")
      ),
      stats
        ? React.createElement("div", { className: "dashboard" },
            React.createElement(Stat, { label: "Users", value: stats.users }),
            React.createElement(Stat, { label: "Products", value: stats.products }),
            React.createElement(Stat, { label: "Orders", value: stats.orders })
          )
        : React.createElement("div", { className: "empty" }, "Login as an admin to view dashboard stats.")
    )
  );
}

function Stat({ label, value }) {
  return (
    React.createElement("div", { className: "stat" },
      React.createElement("span", { className: "muted" }, label),
      React.createElement("strong", null, value ?? 0)
    )
  );
}

function initials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function titleCase(value = "") {
  return value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function money(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
