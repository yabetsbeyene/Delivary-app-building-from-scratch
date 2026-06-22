const Cart =
  require("../models/cart");

const findCustomerCart =
  customerId =>
    Cart.findOne({
      customer:
        customerId
    }).populate(
      "items.product"
    );

exports.getCart =
  async (req, res) => {

    const cart =
      await findCustomerCart(
        req.user._id
      );

    res.json(
      cart || {
        customer:
          req.user._id,
        items: []
      }
    );
  };

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

    const existingItem =
      cart.items.find(
        item =>
          item.product.toString() ===
          productId
      );

    if (existingItem) {
      existingItem.quantity +=
        Number(quantity || 1);
    } else {
      cart.items.push({
        product: productId,
        quantity:
          Number(quantity || 1)
      });
    }

    await cart.save();

    const populatedCart =
      await findCustomerCart(
        req.user._id
      );

    res.json(populatedCart);
};

exports.updateCartItem =
  async (req, res) => {

    const quantity =
      Number(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message:
          "Quantity must be at least 1"
      });
    }

    const cart =
      await Cart.findOne({
        customer:
          req.user._id
      });

    if (!cart) {
      return res.status(404).json({
        message:
          "Cart not found"
      });
    }

    const item =
      cart.items.find(
        cartItem =>
          cartItem.product.toString() ===
          req.params.productId
      );

    if (!item) {
      return res.status(404).json({
        message:
          "Item not found"
      });
    }

    item.quantity =
      quantity;

    await cart.save();

    const populatedCart =
      await findCustomerCart(
        req.user._id
      );

    res.json(populatedCart);
  };

exports.removeCartItem =
  async (req, res) => {

    const cart =
      await Cart.findOne({
        customer:
          req.user._id
      });

    if (!cart) {
      return res.status(404).json({
        message:
          "Cart not found"
      });
    }

    cart.items =
      cart.items.filter(
        item =>
          item.product.toString() !==
          req.params.productId
      );

    await cart.save();

    const populatedCart =
      await findCustomerCart(
        req.user._id
      );

    res.json(populatedCart);
  };

exports.clearCart =
  async (req, res) => {

    await Cart.deleteOne({
      customer:
        req.user._id
    });

    res.json({
      customer:
        req.user._id,
      items: []
    });
  };
