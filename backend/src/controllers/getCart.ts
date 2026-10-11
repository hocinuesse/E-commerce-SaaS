import cartModel from "../models/cartModul";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";

const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    let cart;
    if (userId) {
      cart = await cartModel.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name price discountPrice images stock",
      }).populate("items.shop","orderMethod name"); 
    } else if (sessionId && !userId) {
      cart = await cartModel.findOne({ sessionId: sessionId }).populate({
        path: "items.product",
        select: "name price discountPrice images stock",
      }).populate("items.shop","orderMethod name"); 
    }
    if (!cart) {
      res.status(200).json({
        status: "success",
        cartLength: 0,
        data: {
          cart: {
            items: [],
          },
        },
      });
      return;
    }

    res.status(200).json({
      status: "success",
      cartLength: cart.items.length,
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;
    const productId = req.params.id;

    const query = userId ? { user: userId } : { sessionId: sessionId };

    const cart = await cartModel
      .findOneAndUpdate(
        query,
        { $pull: { items: { product: productId } } as any },
        { new: true },
      )
      .populate({
        path: "items.product",
        select: "name price discountPrice images stock",
      });

    if (!cart) {
      return next(new appError("Cart not found", 404));
    }

    let finalPrice = 0;

    finalPrice = cart.items.reduce(
      (total: number, item: any) =>
        total +
        (item.product
          ? (item.product.discountPrice || item.product.price) * item.quantity
          : 0),
      0,
    );

    cart.totalPrice = finalPrice;
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product removed from cart successfully",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;
    const { action, productId } = req.body;

    if (!["increase", "decrease"].includes(action) || !productId) {
      return next(new appError("Action and productId are required", 400));
    }

    const query = userId ? { user: userId } : { sessionId: sessionId };

    const cart = await cartModel.findOne(query).populate({
      path: "items.product",
      select: "price discountPrice stock",
    });

    if (!cart) {
      return next(new appError("Cart not found", 404));
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.product._id.toString() === productId,
    );
    if (itemIndex === -1) {
      return next(new appError("Product not found in cart", 404));
    }

    const item = cart.items[itemIndex];
    const product = item.product as any;

    if (action === "increase") {
      if (item.quantity + 1 > product.stock) {
        return next(new appError("Insufficient stock", 400));
      }
      item.quantity += 1;
    }

    if (action === "decrease") {
      if (item.quantity - 1 < 1) {
        return next(new appError("Minimum quantity is 1", 400));
      }
      item.quantity -= 1;
    }

    let finalPrice = 0;
    cart.items.forEach((item: any) => {
      if (item.product) {
        finalPrice +=
          (item.product.discountPrice || item.product.price) * item.quantity;
      }
    });

    cart.totalPrice = finalPrice;
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Cart item quantity updated successfully",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getCart, removeFromCart, updateCartItemQuantity };
