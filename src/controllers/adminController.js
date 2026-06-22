const User =
  require("../models/user");

const Product =
  require("../models/Product");

const Order =
  require("../models/Order");

exports.dashboard =
  async (req, res) => {

    const users =
      await User.countDocuments();

    const products =
      await Product.countDocuments();

    const orders =
      await Order.countDocuments();

    res.json({
      users,
      products,
      orders
    });
};
