const Product =
  require("../models/Product");

exports.createProduct =
  async (req, res) => {

    const product =
      await Product.create({

        merchant:
          req.user._id,

        ...req.body

      });

    res.status(201).json(
      product
    );
};

exports.getProducts =
  async (req, res) => {

    const products =
      await Product.find()
        .populate(
          "merchant"
        );

    res.json(products);
};

exports.updateProduct =
  async (req, res) => {

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.json(product);
};

exports.deleteProduct =
  async (req, res) => {

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Deleted"
    });
};