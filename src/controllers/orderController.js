const Order =
  require("../models/Order");

const Cart =
  require("../models/cart");

exports.getMyOrders =
  async (req, res) => {

    const orders =
      await Order.find({
        customer:
          req.user._id
      })
        .populate(
          "items.product"
        )
        .sort({
          createdAt:
            -1
        });

    res.json(orders);
  };

exports.placeOrder =
  async (req, res) => {

    const cart =
      await Cart.findOne({
        customer:
          req.user._id
      }).populate(
        "items.product"
      );

    if (!cart || cart.items.length === 0) {

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

        merchant:
          cart.items[0]?.product?.merchant,

        items:
          cart.items.map(
            item => ({
              product:
                item.product._id,
              quantity:
                item.quantity,
              price:
                item.product.price
            })
          ),

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
