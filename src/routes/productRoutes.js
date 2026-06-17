const router =
  require("express")
    .Router();

const auth =
  require("../middleware/authMiddleware");

const role =
  require("../middleware/roleMiddleware");

const {

  createProduct,
  getProducts,
  updateProduct,
  deleteProduct

} =
  require(
    "../controllers/productController"
  );

router.get(
  "/",
  getProducts
);

router.post(
  "/",
  auth,
  role("merchant"),
  createProduct
);

router.put(
  "/:id",
  auth,
  role("merchant"),
  updateProduct
);

router.delete(
  "/:id",
  auth,
  role("merchant"),
  deleteProduct
);

module.exports =
  router;