// AdminView Component - Admin dashboard

function AdminView({ stats, loadStats }) {
  return (
    React.createElement("section", null,
      React.createElement("div", { className: "section-head" },
        React.createElement("div", null,
          React.createElement("h2", null, "Admin Dashboard"),
          React.createElement("p", { className: "muted" }, "Live counts from users, products, and orders.")
        ),
        React.createElement("button", { className: "btn secondary", onClick: loadStats }, "Refresh")
      ),
      stats
        ? React.createElement("div", { className: "dashboard" },
            React.createElement(Stat, { label: "Users", value: stats.users }),
            React.createElement(Stat, { label: "Products", value: stats.products }),
            React.createElement(Stat, { label: "Orders", value: stats.orders })
          )
        : React.createElement("div", { className: "empty" }, "Login as an admin to view dashboard stats.")
    )
  );
}
