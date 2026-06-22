// roleMiddleware(requiredRole) -> returns middleware that assumes authMiddleware
// has already authenticated the user and set req.user.
module.exports = function(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.role) {
      return res.status(403).json({ message: "Forbidden: role missing" });
    }

    const allowed = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};