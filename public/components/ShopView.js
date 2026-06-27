// ShopView Component - Main shopping interface

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
            React.createElement("button", { className: "btn secondary", onClick: () => setView(user ? "cart" : "shop") }, user ? "View cart" : "Create account"),
            React.createElement("button", { className: "btn secondary", onClick: () => setView("map") }, "View map")
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
