const Cart =
  require("../models/Cart");

exports.addToCart =
  async (req, res) => {

    const {
      productId,
      quantity
    } = req.body;

    let cart =
      await Cart.findOne({
        customer:
          req.user._id
      });

    if (!cart) {

      cart =
        await Cart.create({
          customer:
            req.user._id,
          items: []
        });

    }

    cart.items.push({
      product: productId,
      quantity
    });

    await cart.save();

    res.json(cart);
};