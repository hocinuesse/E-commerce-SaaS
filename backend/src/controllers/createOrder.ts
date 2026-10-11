import { OrderMethod } from "./../interfaces/IShop";
import orderModel from "../models/orderModul";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";
import userModel from "../models/userModul";
import cartModel from "../models/cartModul";
import { OrderStatus } from "../interfaces/ICart";
import shopModel from "../models/shopModul";
import productModel from "../models/productModul";

const createOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new appError("User not authenticated", 401));
    }

    if (!shippingAddress) {
      return next(new appError("shippingAddress is required", 400));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new appError("User not found", 404));
    }

    const cart = await cartModel.findOne({ user: userId }).lean();
    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new appError("Cart is empty or not found", 400));
    }

    const productIds = cart.items.map((item: any) => item.product);
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .lean();

    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const enrichedItems: any[] = [];
    for (const item of cart.items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        return next(new appError(`Product not found: ${item.product}`, 404));
      }

      const itemQuantity = Number(item.quantity) || 1;

      if (product.stock < itemQuantity) {
        return next(
          new appError(`Product "${product.name}" is out of stock`, 400),
        );
      }

      const shopId = item.shop || product.shop;
      if (!shopId) {
        return next(
          new appError(`Shop missing for product: ${product._id}`, 400),
        );
      }

      const discount = Number(product.discountPrice);
      const original = Number(product.price);

      const productPrice =
        !isNaN(discount) && discount > 0
          ? discount
          : !isNaN(original)
            ? original
            : 0;

      enrichedItems.push({
        ...item,
        quantity: itemQuantity,
        shop: shopId.toString(),
        price: productPrice,
      });
    }

    const ordersByShop = new Map<
      string,
      { items: any[]; totalAmount: number }
    >();

    for (const item of enrichedItems) {
      const shopId = item.shop;

      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const itemTotal = price * quantity;

      if (!ordersByShop.has(shopId)) {
        ordersByShop.set(shopId, { items: [], totalAmount: 0 });
      }

      const shopOrder = ordersByShop.get(shopId)!;
      shopOrder.items.push(item);

      shopOrder.totalAmount += isNaN(itemTotal) ? 0 : itemTotal;
    }

    const createdOrders: any[] = [];
    const bulkStockUpdates: any[] = [];

    for (const [shopId, group] of ordersByShop.entries()) {
      const newOrder = await orderModel.create({
        user: userId,
        shop: shopId,
        items: group.items,
        shippingAddress,
        totalAmount: Number(group.totalAmount.toFixed(2)),
        status: OrderStatus.PENDING,
        paymentMethod: paymentMethod,
        cartId: cart._id,
      });

      createdOrders.push(newOrder);

      for (const item of group.items) {
        bulkStockUpdates.push({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: -item.quantity } },
          },
        });
      }
    }

    if (bulkStockUpdates.length > 0) {
      await productModel.bulkWrite(bulkStockUpdates);
    }

    await cartModel.updateOne(
      { _id: cart._id },
      { $set: { items: [], totalPrice: 0 } },
    );

    res.status(201).json({
      status: "success",
      results: createdOrders.length,
      data: { orders: createdOrders },
    });
  } catch (error: any) {
    next(error);
  }
};

const getUserOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new appError("User not authenticated", 401));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new appError("User not found", 404));
    }

    const orders =
      (await orderModel
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .populate(
          "items.product",
          "name price images description category options",
        )) || [];

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getShopOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return next(new appError("Shop not authenticated", 401));
    }

    const shop = await shopModel.findById(shopId);
    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    const orders =
      (await orderModel
        .find({ "items.shop": shopId })
        .sort({ createdAt: -1 })
        .populate(
          "items.product",
          "name price images description category options",
        )) || [];

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return next(new appError("Order ID and status are required", 400));
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return next(new appError("Order not found", 404));
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

export { createOrder, getUserOrders, getShopOrders, updateOrderStatus };
