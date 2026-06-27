// Stat Component - Displays a single statistic

function Stat({ label, value }) {
  return (
    React.createElement("div", { className: "stat" },
      React.createElement("span", { className: "muted" }, label),
      React.createElement("strong", null, value ?? 0)
    )
  );
}
