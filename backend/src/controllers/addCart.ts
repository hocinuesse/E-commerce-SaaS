import { IProductInCart } from "./../interfaces/ICart";
import { Response, NextFunction } from "express";
import cartModel from "../models/cartModul";
import appError from "../utils/appError";
import productModel from "../models/productModul";

/**
 * @desc Add a product to the cart
 * @route POST /api/v1/cart/add
 * @access Public
 */

const addToCart = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId, quantity, options } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    if (!productId || !quantity) {
      return next(new appError("Product ID and quantity are required", 400));
    }

    const productItem = await productModel.findById(productId);
    if (!productItem) {
      return next(new appError("Product not found", 404));
    }

    if (quantity > productItem.stock) {
      return next(new appError("Insufficient stock", 400));
    }

    const finalPrice =
      productItem.discountPrice && productItem.discountPrice < productItem.price
        ? productItem.discountPrice
        : productItem.price;

    let cart;
    if (userId) {
      cart = await cartModel.findOne({ user: userId });
      if (!cart && sessionId) {
        cart = await cartModel.findOne({ sessionId: sessionId });
        if (cart) {
          cart.user = userId;
        }
      }
    } else if (sessionId) {
      cart = await cartModel.findOne({ sessionId: sessionId });
    }

    if (!cart) {
      try {
        cart = await cartModel.create({
          user: userId || undefined,
          sessionId: sessionId || undefined,
          items: [
            {
              product: productId,
              quantity: quantity,
              price: finalPrice,
              options: options || [],
              shop: productItem.shop,
            },
          ],
          totalPrice: finalPrice * quantity,
        });
        return;
      } catch (err: any) {
        if (err.code === 11000) {
          if (userId) {
            cart = await cartModel.findOne({ user: userId });
          }
          if (!cart && sessionId) {
            cart = await cartModel.findOne({ sessionId: sessionId });
          }
          if (!cart) throw err;
        } else {
          throw err;
        }
      }
    }

    // const existingItemIndex = cart.items.findIndex(
    //   (item: IProductInCart) =>
    //     item.product.toString() === productId &&
    //     JSON.stringify(item.options || []) === JSON.stringify(options || []),
    // );

    const incomingOptionsKey = Array.isArray(options)
      ? options
        .map((o: any) => `${o.name}:${o.value}`)
        .sort()
        .join("|")
      : "";

    const existingItemIndex = cart.items.findIndex((item: IProductInCart) => {
      const existingProdId = item.product?._id
        ? item.product._id.toString()
        : item.product?.toString();

      const isSameProduct = existingProdId === productId.toString();
      if (!isSameProduct) return false;

      const existingOptions = item.options;
      const existingOptionsKey = Array.isArray(existingOptions)
        ? existingOptions
          .map((o: any) => `${o.name}:${o.value}`)
          .sort()
          .join("|")
        : "";

      return existingOptionsKey === incomingOptionsKey;
    });

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > productItem.stock) {
        return next(new appError("Insufficient stock", 400));
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = finalPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: finalPrice,
        options: options || [],
        shop: productItem.shop,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0,
    );

    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
