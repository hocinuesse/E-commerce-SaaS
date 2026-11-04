import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";
import userModel from "../models/userModel";

const refreshCookieToken = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;
    if (req.cookies && req.cookies.refreshToken) {
      token = req.cookies.refreshToken;
    }
    if (!token) {
      return next(
        new appError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
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

    const newToken = jwt.sign(
      {
        id: currentUser._id,
        role: currentUser.role,
        email: currentUser.email,
        phone: currentUser.phone,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
      },
    );

    res.cookie("accessToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
    });
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return next(
        new appError(
          "Your session has expired totally. Please log in again.",
          401,
        ),
      );
    }
    return next(new appError("Internal server error", 500));
  }
};

export default refreshCookieToken;
