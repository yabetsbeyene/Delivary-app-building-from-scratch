const router =
  require("express")
    .Router();

const auth =
  require("../middleware/authMiddleware");

const {
  placeOrder,
  getMyOrders
} =
  require("../controllers/orderController");

router.get(
  "/",
  auth,
  getMyOrders
);

router.post(
  "/",
  auth,
  placeOrder
);

module.exports =
  router;
