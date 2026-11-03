import userModel from "../models/userModul";
import { Request, Response, NextFunction } from "express";
import appError from "../utils/appError";
import { IUser } from "../interfaces/IUser";
import { UserRole } from "../interfaces/IUser";
import productModel from "../models/productModul";

const createManager = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return next(new appError("All fields are required", 400));
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(new appError("Email already in use", 400));
    }

    const newManager: IUser = await userModel.create({
      name,
      email,
      password,
      phone,
      role: UserRole.MANAGER,
      shopId: req.user.shopId,
    });

    newManager.password = undefined;

    res.status(201).json({
      status: "success",
      data: {
        user: newManager,
      },
    });
  } catch (error) {
    next(new appError("Failed to create manager", 500));
  }
};

const getAllManagers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user.shopId;
    if (!shopId) {
      return next(new appError("Shop not found", 401));
    }

    const managers = await userModel
      .find({ shopId, role: UserRole.MANAGER })
      .select("-password");
    if (!managers) {
      return next(new appError("Managers not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        managers,
      },
    });
  } catch (error: Error | any) {
    next(new appError(error.message, 500));
  }
};

const deleteManager = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      next(new appError("manager id not found", 400));
    }

    const existingManager = await userModel.findById(id);
    if (!existingManager || existingManager.role !== UserRole.MANAGER) {
      return next(new appError("Manager not found", 404));
    }

    if (existingManager.shopId?.toString() !== req.user.shopId?.toString()) {
      return next(
        new appError("You do not have permission to delete this manager", 403),
      );
    }

    await userModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "Manager has been successfully removed from your shop",
    });
  } catch (error: Error | any) {
    next(new appError(error.message, 400));
  }
};

const updatingQuantity = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User not authenticated",
      });
    }
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id || quantity === undefined) {
      return next(new appError("Manager id and quantity are required", 400));
    }

    const product = await productModel.findOne({
      _id: id,
      shop: req.user.shopId,
    });
    if (!product) {
      return next(new appError("Product not found", 404));
    }

    product.stock = quantity;
    await product.save();

    res.status(200).json({
      status: "success",
      message: "Product quantity updated successfully",
      data: {
        product,
      },
    });
  } catch (error: Error | any) {
    next(new appError(error.message, 400));
  }
};

const toggleProductVisibility = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new appError("Product id is required", 400));
    }

    const product = await productModel.findOne({
      _id: id,
      shop: req.user.shopId,
    });

    if (!product) {
      return next(new appError("Product not found", 404));
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      status: "success",
      message: `Product visibility toggled to ${product.isActive ? "active" : "inactive"}`,
      data: {
        product,
      },
    });
  } catch (error: Error | any) {
    next(new appError(error.message, 400));
  }
};

export {
  createManager,
  getAllManagers,
  deleteManager,
  updatingQuantity,
  toggleProductVisibility,
};
