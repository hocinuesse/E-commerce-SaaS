import { Schema, Document, model } from "mongoose";
import { OrderStatus } from "../interfaces/ICart";
import { OrderMethod } from "../interfaces/IShop";
import { IOrder, ShippingType } from "../interfaces/IOrder";

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        shop: {
          type: Schema.Types.ObjectId,
          ref: "Shop",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      wilaya: { type: String, required: true, trim: true },
      baladiya: { type: String, required: true, trim: true },
      addressDetail: { type: String, trim: true },
      shippingType: {
        type: String,
        enum: Object.values(ShippingType),
        default: ShippingType.PICKUP,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(OrderMethod),
      default: OrderMethod.NONE,
    },
    cartId: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
  },
  { timestamps: true },
);

const orderModel = model<IOrder>("Order", orderSchema, "orders");

export default orderModel;
