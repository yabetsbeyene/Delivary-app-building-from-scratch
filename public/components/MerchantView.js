// MerchantView Component - Product management interface

function MerchantView({ products, user, createProduct, deleteProduct }) {
  const [form, setForm] = React.useState({
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
