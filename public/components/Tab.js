// Tab Component - Navigation tab button

function Tab({ active, children, onClick }) {
  return React.createElement("button", {
    className: `tab ${active ? "active" : ""}`,
    onClick
  }, children);
}
