// ProductCard Component - Displays a single product

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
