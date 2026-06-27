// AuthPanel Component - Login and register panel

function AuthPanel({ login, register, loading }) {
  const [mode, setMode] = React.useState("login");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer"
  });

  const update = event => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = event => {
    event.preventDefault();
    mode === "login"
      ? login({ email: form.email, password: form.password })
      : register(form);
  };

  return (
    React.createElement("div", { className: "panel auth-panel" },
      React.createElement("div", { className: "switcher" },
        React.createElement("button", { className: mode === "login" ? "active" : "", onClick: () => setMode("login") }, "Login"),
        React.createElement("button", { className: mode === "register" ? "active" : "", onClick: () => setMode("register") }, "Register")
      ),
      React.createElement("form", { className: "form", onSubmit: submit },
        mode === "register" && React.createElement(Field, { label: "Name", name: "name", value: form.name, onChange: update, required: true }),
        React.createElement(Field, { label: "Email", name: "email", type: "email", value: form.email, onChange: update, required: true }),
        React.createElement(Field, { label: "Password", name: "password", type: "password", value: form.password, onChange: update, required: true }),
        mode === "register" && React.createElement(Field, { label: "Phone", name: "phone", value: form.phone, onChange: update }),
        mode === "register" && React.createElement("div", { className: "field" },
          React.createElement("label", null, "Role"),
          React.createElement("select", { className: "select", name: "role", value: form.role, onChange: update },
            ["customer", "merchant", "driver", "admin"].map(role => React.createElement("option", { key: role, value: role }, titleCase(role)))
          )
        ),
        React.createElement("button", { className: "btn full", disabled: loading }, loading ? "Please wait" : mode === "login" ? "Login" : "Create account")
      )
    )
  );
}
