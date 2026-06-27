// Field Component - Reusable form field

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
