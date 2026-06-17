const Order =
  require("../models/Order");

const Cart =
  require("../models/Cart");

exports.placeOrder =
  async (req, res) => {

    const cart =
      await Cart.findOne({
        customer:
          req.user._id
      }).populate(
        "items.product"
      );

    if (!cart) {

      return res.status(404).json({
        message:
          "Cart empty"
      });

    }

    let total = 0;

    cart.items.forEach(
      item => {

        total +=
          item.product.price *
          item.quantity;

      }
    );

    const order =
      await Order.create({

        customer:
          req.user._id,

        items:
          cart.items,

        totalAmount:
          total

      });

    await Cart.deleteOne({
      _id: cart._id
    });

    res.status(201).json(
      order
    );
};