const router =
  require("express")
    .Router();

const auth =
  require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} =
  require("../controllers/cartController");

router.get(
  "/",
  auth,
  getCart
);

router.post(
  "/",
  auth,
  addToCart
);

router.put(
  "/:productId",
  auth,
  updateCartItem
);

router.delete(
  "/:productId",
  auth,
  removeCartItem
);

router.delete(
  "/",
  auth,
  clearCart
);

module.exports =
  router;
