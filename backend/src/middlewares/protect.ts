import util from "util";
import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";
import userModel from "../models/userModul";
import shopModel from "../models/shopModul";
import { UserRole } from "../interfaces/IUser";
import { ShopStatus } from "../interfaces/IShop";

const protect = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return next(
        new appError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    const decoded: any = await (util.promisify(jwt.verify) as any)(
      token,
      process.env.JWT_SECRET as string,
    );

    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
      return next(
        new appError(
          "The user belonging to this token does no longer exist.",
          401,
        ),
      );
    }

    const shopId = currentUser.shopId;
    if (currentUser.role === UserRole.VENDOR && !shopId) {
      return next(
        new appError(
          "You are a vendor but do not have an associated shop. Please contact support.",
          401,
        ),
      );
    }
    const shopIsActive = await shopModel.findById(currentUser.shopId);
    if (
      currentUser.role === UserRole.VENDOR &&
      shopIsActive?.status !== ShopStatus.ACTIVE
    ) {
      return next(
        new appError("Your shop is not active. Please contact support.", 401),
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new appError(
          "User recently changed password! Please log in again.",
          401,
        ),
      );
    }

    req.user = currentUser;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(
        new appError("Your session has expired! Please log in again.", 401),
      );
    }
    if (err.name === "JsonWebTokenError") {
      return next(new appError("Invalid token! Please log in again.", 401));
    }

    return next(new appError("Internal server error", 500));
  }
};

export default protect;
