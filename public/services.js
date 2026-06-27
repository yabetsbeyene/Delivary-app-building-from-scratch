// API Service - Handles all backend communication

class ApiService {
  constructor(token = null) {
    this.token = token;
    this.baseUrl = API;
  }

  setToken(token) {
    this.token = token;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  }

  // Auth APIs
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  }

  // Product APIs
  async getProducts() {
    return this.request("/products");
  }

  async createProduct(productData) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify({
        ...productData,
        price: Number(productData.price),
        isAvailable: true
      })
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, { method: "DELETE" });
  }

  // Cart APIs
  async getCart() {
    return this.request("/cart");
  }

  async addToCart(productId, quantity = 1) {
    return this.request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(productId, quantity) {
    return this.request(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(productId) {
    return this.request(`/cart/${productId}`, { method: "DELETE" });
  }

  // Order APIs
  async getOrders() {
    return this.request("/orders");
  }

  async placeOrder() {
    return this.request("/orders", { method: "POST" });
  }

  // Admin APIs
  async getDashboard() {
    return this.request("/admin/dashboard");
  }
}

// Create singleton instance
const apiService = new ApiService();
