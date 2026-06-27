// Utility functions

function initials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function titleCase(value = "") {
  return value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function distanceKm(from, to) {
  const earthRadiusKm = 6371;
  const latDistance = degreesToRadians(to[0] - from[0]);
  const lngDistance = degreesToRadians(to[1] - from[1]);
  const startLat = degreesToRadians(from[0]);
  const endLat = degreesToRadians(to[0]);
  const value =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(startLat) * Math.cos(endLat) *
    Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function degreesToRadians(value) {
  return value * Math.PI / 180;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}

function money(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}
