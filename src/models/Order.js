const mongoose = require("mongoose");

const orderSchema =
  new mongoose.Schema(
    {
      customer: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      merchant: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      driver: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      items: [
        {
          product: {
            type:
              mongoose.Schema.Types.ObjectId,
            ref: "Product"
          },

          quantity: Number,

          price: Number
        }
      ],

      totalAmount: Number,

      orderStatus: {
        type: String,
        enum: [
          "placed",
          "accepted",
          "preparing",
          "ready",
          "picked_up",
          "delivered",
          "cancelled"
        ],
        default: "placed"
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );