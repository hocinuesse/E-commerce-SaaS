import { Schema, model } from "mongoose";
import { ICart } from "../interfaces/ICart";
import { IProductInCart } from "../interfaces/ICart";

const cartItemSchema = new Schema<IProductInCart>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Cart item must have a product"],
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Cart item must have a quantity"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Cart item must have a price"],
      min: [0, "Price must be greater than or equal to 0"],
    },
    options: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    items: [cartItemSchema],
    sessionId: {
      type: String,
      required: false,
    },
    totalPrice: {
      type: Number,
      required: [true, "Cart must have a total price"],
      min: [0, "Total price must be greater than or equal to 0"],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

const cartModel = model<ICart>("Cart", cartSchema, "carts");
export default cartModel;
