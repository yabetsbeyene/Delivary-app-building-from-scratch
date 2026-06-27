// App Component - Main application logic and state management

const { useEffect, useMemo, useState } = React;

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

  // Update API service token when session changes
  useEffect(() => {
    apiService.setToken(token);
  }, [token]);

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
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const loadCart = async () => {
    if (!token) return setCart({ items: [] });
    try {
      const data = await apiService.getCart();
      setCart(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const loadOrders = async () => {
    if (!token) return setOrders([]);
    try {
      const data = await apiService.getOrders();
      setOrders(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const loadStats = async () => {
    if (!token || user?.role !== "admin") return setStats(null);
    try {
      const data = await apiService.getDashboard();
      setStats(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load session-dependent data when session changes
  useEffect(() => {
    localStorage.setItem("delivery-session", JSON.stringify(session));
    loadCart();
    loadOrders();
    loadStats();
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

  // Authentication handlers
  const login = async form => {
    setLoading(true);
    try {
      const data = await apiService.login(form);
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
      await apiService.register(form);
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

  // Cart handlers
  const addToCart = async product => {
    if (!token) {
      setView("shop");
      flash("Sign in as a customer to add items to your cart", "error");
      return;
    }
    try {
      const data = await apiService.addToCart(product._id, 1);
      setCart(data);
      flash(`${product.name} added to cart`);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    try {
      const data = await apiService.updateCartItem(productId, quantity);
      setCart(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const removeItem = async productId => {
    try {
      const data = await apiService.removeFromCart(productId);
      setCart(data);
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const placeOrder = async () => {
    try {
      await apiService.placeOrder();
      await loadCart();
      await loadOrders();
      setView("orders");
      flash("Order placed successfully");
    } catch (error) {
      flash(error.message, "error");
    }
  };

  // Product handlers (merchant)
  const createProduct = async form => {
    try {
      await apiService.createProduct(form);
      await loadProducts();
      setView("shop");
      flash("Product published");
    } catch (error) {
      flash(error.message, "error");
    }
  };

  const deleteProduct = async id => {
    try {
      await apiService.deleteProduct(id);
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
        view === "map" && React.createElement(MapView, {
          locations: fallbackRestaurants
        }),
        view === "admin" && React.createElement(AdminView, {
          stats,
          loadStats
        })
      )
    )
  );
}
// Initialize app
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
