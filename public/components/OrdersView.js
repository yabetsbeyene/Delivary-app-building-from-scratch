// OrdersView Component - Order history interface

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
