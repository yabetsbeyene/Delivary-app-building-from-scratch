// Topbar Component - Main navigation header

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
        React.createElement(Tab, { active: view === "map", onClick: () => setView("map") }, "Map"),
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
