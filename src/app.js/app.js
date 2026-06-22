const express =
  require("express");

const cors =
  require("cors");

const morgan =
  require("morgan");

const path =
  require("path");

const authRoutes =
  require(
    "../routes/authRoutes"
  );

const productRoutes =
  require(
    "../routes/productRoutes"
  );

const adminRoutes =
  require(
    "../routes/routesforAdmin"
  );

const cartRoutes =
  require(
    "../routes/cartRoutes"
  );

const orderRoutes =
  require(
    "../routes/orderRoutes"
  );

const app =
  express();

app.use(express.json());

app.use(cors());

app.use(morgan("dev"));

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  express.static(
    path.join(__dirname, "../../public")
  )
);

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/index.html")
  );
});

module.exports = app;
