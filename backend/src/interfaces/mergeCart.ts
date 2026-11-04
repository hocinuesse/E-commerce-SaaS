import appError from "../utils/appError";
import cartModel from "../models/cartModel";
import { Types } from "mongoose";

const mergeCart = async (sessionId: string, userId: Types.ObjectId) => {
  try {
    const userCart = await cartModel.findOne({ user: userId });
    const guestCart = await cartModel.findOne({ sessionId });

    if (!guestCart) {
      return; // No guest cart to merge, exit early
    }
    if (!userCart) {
      guestCart.user = userId as any;
      guestCart.sessionId = undefined;
      await guestCart.save();
      return;
    }

    guestCart.items.forEach((item: any) => {
      const existingItem = userCart.items.findIndex(
        (userItem) => userItem.product.toString() === item.product.toString(),
      );

      if (existingItem > -1) {
        userCart.items[existingItem].quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    });

    await userCart.populate("items.product", "price discountPrice");

    userCart.totalPrice = userCart.items.reduce(
      (total, item: any) =>
        total +
        (item.product.discountPrice || item.product.price) * item.quantity,
      0,
    );

    await userCart.save();
    await cartModel.deleteOne({ _id: guestCart._id });
  } catch (error: any) {
    console.error("❌ Cart Merge Error:", error);
    throw new appError(
      error.message || "Error occurred while merging cart",
      500,
    );
  }
};

export default mergeCart;
