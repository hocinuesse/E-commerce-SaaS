import { Request, Response, NextFunction } from "express";
import shopModel from "../models/shopModel";
import appError from "../utils/appError";
import mongoose from "mongoose";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";
import { OrderStatus } from "../interfaces/ICart";
import slugify from "slugify";

const createShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return next(new appError("Missing required fields", 400));
    }
    const ownerId = req.user?._id;

    const existingShop = await shopModel.findOne({ owner: ownerId });
    if (existingShop) {
      return next(
        new appError(
          "You already have a shop. Only one shop per user is allowed.",
          400,
        ),
      );
    }

    const existingShopName = await shopModel.findOne({ name: req.body.name });
    if (existingShopName) {
      return next(
        new appError(
          "A shop with this name already exists. Please choose a different name.",
          400,
        ),
      );
    }

    const newShop = await shopModel.create({
      name,
      description,
      owner: ownerId,
    });

    const shopOwner = mongoose.model("User");
    await shopOwner.findByIdAndUpdate(ownerId, {
      "vendorInfo.storeName": newShop.name,
      shopId: newShop._id,
    });

    res.status(201).json({
      status: "success",
      data: {
        shop: newShop,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(
        new appError(
          "Shop name already exists. Please choose a different name.",
          400,
        ),
      );
    }
    return next(error);
  }
};

const getShopBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const shop = await shopModel
      .findOne({ slug, isActive: true })
      .populate("owner", "name email phone");

    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    const products = await productModel
      .find({ shop: shop._id, isActive: true })
      .select(
        "name description stock slug price discountPrice category images options",
      );

    res.status(200).json({
      status: "success",
      data: {
        shop,
        products,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User not authenticated",
      });
    }

    const shop = await shopModel.findOne({ owner: userId });
    if (!shop) {
      return res.status(200).json({
        status: "success",
        data: {
          shop: null,
        },
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        shop,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shops = await shopModel
      .find({ isActive: true })
      .populate("owner", "name email phone");
    res.status(200).json({
      status: "success",
      results: shops.length,
      data: {
        shops,
      },
    });
  } catch (error: Error | any) {
    return next(error);
  }
};

const getShopById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new appError("Shop ID is required", 400));
    }

    const shop = await shopModel
      .findById(id)
      .populate("owner", "name email phone");

    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        shop,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const totalSalesReport = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.body;
    if (!shopId) {
      return next(new appError("Shop ID is required", 400));
    }

    const existingShop = await shopModel.findById(shopId);
    if (!existingShop) {
      return next(new appError("Shop not found", 404));
    }

    const userOrders = await orderModel.find({
      "items.shop": shopId,
      status: { $in: [OrderStatus.DELIVERED] },
    });

    const totalSales = userOrders.reduce((acc: any, order: any) => {
      return acc + order.totalAmount;
    }, 0);

    const newOrders = await orderModel.find({
      "items.shop": shopId,
      status: { $in: [OrderStatus.PENDING] },
    });

    res.status(200).json({
      status: "success",
      data: {
        totalSales,
        newOrders: newOrders.length,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getMonthlySalesReport = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.body;
    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const existingShop = await shopModel.findById(shopId);
    if (!existingShop) {
      return next(new appError("Shop not found", 404));
    }

    const yearlyOrders = await orderModel.find({
      "items.shop": shopId,
      status: { $in: [OrderStatus.DELIVERED] },
      createdAt: { $gte: startOfYear, $lte: endOfYear },
    });

    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "جويلية",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    const chartData = monthNames.map((name, index) => {
      const monthlyOrder = yearlyOrders.filter((order) => {
        const orderMonth = new Date(order.createdAt).getMonth();
        return orderMonth === index;
      });

      const sales = monthlyOrder.reduce((sum, item) => {
        return sum + item.totalAmount;
      }, 0);

      const ordersCount = monthlyOrder.length || 0;

      return {
        name,
        sales,
        orders: ordersCount,
      };
    });
    res.status(200).json({
      status: "success",
      data: chartData,
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const viewCount = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopSlug } = req.params;

    if (!shopSlug) {
      return next(new appError("Shop Slug is required", 400));
    }

    const shop = await shopModel.findOne({ slug: shopSlug, isActive: true });
    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    shop.viewCount += 1;
    await shop.save();

    res.status(200).json({
      status: "success",
      data: {
        viewCount: shop.viewCount,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const updateShopSettings = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    const body = req.body;
    if (!shopId) {
      return next(new appError("Shop ID is required", 400));
    }
    if (body.slug) {
      body.slug = slugify(body.slug, { lower: true, strict: true });
    }
    const updatedShop = await shopModel.findByIdAndUpdate(shopId, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedShop) {
      return next(new appError("Shop not updated", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        shop: updatedShop,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const createReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    const { rating, comment, name } = req.body;

    if (!shopId || !rating || !comment || !name) {
      return next(
        new appError("Shop ID, rating, comment, and name are required", 400),
      );
    }

    const shop = await shopModel.findById(shopId);
    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    const newReview = {
      name,
      rating,
      comment,
      createdAt: new Date(),
    };
    shop.reviews.push(newReview);
    shop.ratingCount = shop.reviews.length;
    shop.rating =
      shop.reviews.reduce((acc, review) => acc + review.rating, 0) /
      shop.ratingCount;

    await shop.save();

    res.status(201).json({
      status: "success",
      message: "Review added successfully",
      data: {
        review: newReview,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getProductReviews = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;

    const product = await productModel.findById(shopId);
    if (!product) {
      return next(new appError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        reviews: product.reviews,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

export {
  createShop,
  getShopBySlug,
  getMyShop,
  getAllShops,
  getShopById,
  totalSalesReport,
  viewCount,
  getMonthlySalesReport,
  updateShopSettings,
  createReview,
  getProductReviews,
};
