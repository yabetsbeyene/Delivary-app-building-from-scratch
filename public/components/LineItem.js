// LineItem Component - Displays a single cart item

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
