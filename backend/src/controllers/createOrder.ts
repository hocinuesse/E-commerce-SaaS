import mongoose from "mongoose";
import { OrderMethod } from "./../interfaces/IShop";
import orderModel from "../models/orderModel";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";
import userModel from "../models/userModel";
import cartModel from "../models/cartModel";
import { OrderStatus } from "../interfaces/ICart";
import shopModel from "../models/shopModel";
import productModel from "../models/productModel";
import { UserRole } from "../interfaces/IUser";
import { notifyNewOrder, notifyOrderStatusChanged } from "../utils/socket";

const createOrder = async (req: any, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      await session.abortTransaction();
      return next(new appError("User not authenticated", 401));
    }

    if (!shippingAddress) {
      await session.abortTransaction();
      return next(new appError("shippingAddress is required", 400));
    }

    const user = await userModel.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return next(new appError("User not found", 404));
    }

    const cart = await cartModel.findOne({ user: userId }).session(session);
    if (!cart || !cart.items || cart.items.length === 0) {
      await session.abortTransaction();
      return next(new appError("Cart is empty or not found", 400));
    }

    const productIds = cart.items.map((item: any) => item.product);
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .session(session);

    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    const enrichedItems: any[] = [];
    for (const item of cart.items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        await session.abortTransaction();
        return next(new appError(`Product not found: ${item.product}`, 404));
      }

      const itemQuantity = Number(item.quantity) || 1;

      if (product.stock < itemQuantity) {
        await session.abortTransaction();
        return next(
          new appError(`Product "${product.name}" is out of stock`, 400),
        );
      }

      const shopId = item.shop || product.shop;
      if (!shopId) {
        await session.abortTransaction();
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
        ...(typeof (item as any).toObject === "function" ? (item as any).toObject() : item),
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

    // Atomically decrement stock and verify availability per product in session
    for (const item of enrichedItems) {
      const updateResult = await productModel.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        {
          $inc: {
            stock: -item.quantity,
            salesCount: item.quantity,
          },
        },
        { session },
      );

      if (updateResult.matchedCount === 0) {
        await session.abortTransaction();
        return next(
          new appError(
            "Insufficient stock for one or more items during order processing",
            400,
          ),
        );
      }
    }

    const createdOrders: any[] = [];
    for (const [shopId, group] of ordersByShop.entries()) {
      const [newOrder] = await orderModel.create(
        [
          {
            user: userId,
            shop: shopId,
            items: group.items,
            shippingAddress,
            totalAmount: Number(group.totalAmount.toFixed(2)),
            status: OrderStatus.PENDING,
            paymentMethod: paymentMethod,
            cartId: cart._id,
          },
        ],
        { session },
      );

      createdOrders.push(newOrder);
    }

    await cartModel.updateOne(
      { _id: cart._id },
      { $set: { items: [], totalPrice: 0 } },
      { session },
    );

    await session.commitTransaction();

    // Dispatch real-time notifications to relevant shops
    for (const order of createdOrders) {
      try {
        notifyNewOrder(order.shop.toString(), order);
      } catch (err) {
        // Socket emission error should not affect order response
      }
    }

    res.status(201).json({
      status: "success",
      results: createdOrders.length,
      data: { orders: createdOrders },
    });
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    session.endSession();
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
        .find({
          $or: [{ shop: shopId }, { "items.shop": shopId }],
        })
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

    if (!Object.values(OrderStatus).includes(status)) {
      return next(new appError("Invalid order status", 400));
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return next(new appError("Order not found", 404));
    }

    const user = req.user;
    const isOwner = user?.shopId && order.shop.toString() === user.shopId.toString();
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(
        new appError("You are not authorized to update this order", 403),
      );
    }

    order.status = status;
    await order.save();

    try {
      notifyOrderStatusChanged(order.user.toString(), order);
    } catch (err) {
      // Socket emission error should not affect order response
    }

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
