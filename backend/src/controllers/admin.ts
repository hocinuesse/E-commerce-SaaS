import shopModel from "../models/shopModul";
import orderModel from "../models/orderModul";
import { Request, Response, NextFunction } from "express";
import appError from "../utils/appError";
import { ShopStatus } from "../interfaces/IShop";
import userModel from "../models/userModul";
import productModel from "../models/productModul";
import { UserRole } from "../interfaces/IUser";

const updateShopsStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    const isShopExist = await shopModel.findById(shopId);
    if (!isShopExist) {
      return next(new appError("Shop not found", 404));
    }

    if (!Object.values(ShopStatus).includes(status as ShopStatus)) {
      return next(new appError("Invalid shop status", 400));
    }

    const updateShop = await shopModel.findByIdAndUpdate(
      shopId,
      { status },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      message: `Shop status updated to ${status}`,
      data: { shop: updateShop },
    });
  } catch (error: Error | any) {
    return next(new appError(error.message || "Failed to get shops", 500));
  }
};

const getAllShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const shops = await shopModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("owner", "name email phone role shopId");

    const activeShopsCount = await shopModel.countDocuments({
      status: ShopStatus.ACTIVE,
    });

    res.status(200).json({
      status: "success",
      data: {
        shops,
        activeShopsCount,
        pagination: {
          length: shops.length,
          currentPage: page,
        },
      },
    });
  } catch (error: Error | any) {
    return next(error);
  }
};

const totalUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new appError("User not authenticated", 401));
    }

    const totalUsers = await userModel.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
      },
    });
  } catch (error: Error | any) {
    return next(
      new appError(error.message || "Failed to get total users report", 500),
    );
  }
};

const totalOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new appError("User not authenticated", 401));
    }

    const totalOrders = await orderModel.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        totalOrders,
      },
    });
  } catch (error: Error | any) {
    return next(
      new appError(error.message || "Failed to get total orders report", 500),
    );
  }
};

const getShopDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return next(new appError("Shop ID is required", 400));
    }

    const shop = await shopModel
      .findById(shopId)
      .populate("owner", "name email phone role shopId");
    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { shop },
    });
  } catch (error: Error | any) {
    return next(
      new appError(error.message || "Failed to get shop details", 500),
    );
  }
};

const getPlatformStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let platformStats = {
      totalProducts: 0,
      totalCustomers: 0,
      totalShops: 0,
      avgRating: 0,
    };

    platformStats.totalProducts = await productModel.countDocuments();
    platformStats.totalCustomers = await userModel.countDocuments({
      role: UserRole.CLIENT,
    });
    platformStats.totalShops = await shopModel.countDocuments();
    const avgRatingResult = await productModel.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    platformStats.avgRating = avgRatingResult[0]?.avgRating || 0;

    res.status(200).json({
      status: "success",
      data: { ...platformStats },
    });
  } catch (error: Error | any) {
    return next(
      new appError(error.message || "Failed to get platform stats", 500),
    );
  }
};

const getBestSellers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;

    const parsedLimit = parseInt(limit as string) || 10;
    const safeLimit = Math.min(Math.max(1, parsedLimit), 50);

    const bestSellers = await shopModel
      .find({ isActive: true })
      .sort({ rating: -1, ratingCount: -1 })
      .limit(safeLimit);

    res.status(200).json({
      status: "success",
      data: {
        bestSellers,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

export {
  updateShopsStatus,
  getAllShops,
  getShopDetails,
  totalUsers,
  totalOrders,
  getPlatformStats,
  getBestSellers,
};
