// CartView Component - Shopping cart interface

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
