import jwt from "jsonwebtoken";
import { Response, NextFunction, Request } from "express";
import userModel from "../models/userModul";
import appError from "../utils/appError";
import { UserRole } from "../interfaces/IUser";
import mergeCart from "../interfaces/mergeCart";

const createSendToken = async (
  user: any,
  statusCode: number,
  res: Response,
) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email, phone: user.phone },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    } as any,
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email, phone: user.phone },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    } as any,
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  user.refreshToken = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, role, vendorInfo } = req.body;
    if (!name || !email || !password || !phone || !role) {
      return next(new appError("Missing required fields", 400));
    }

    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return next(new appError("Email already in use", 400));
    }

    if (role === UserRole.VENDOR && (!vendorInfo || !vendorInfo.storeName)) {
      return next(new appError("Missing required vendor information", 400));
    }

    const newUser = await userModel.create({
      name,
      email,
      password,
      phone,
      role,
      vendorInfo: role === UserRole.VENDOR ? vendorInfo : undefined,
    });

    await mergeCart(req.sessionID, newUser._id);

    await createSendToken(newUser, 201, res);
  } catch (error: Error | any) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError("Please provide email and password", 400));
    }
    const findUser = await userModel.findOne({ email }).select("+password");
    if (!findUser || !(await findUser.comparePassword(password))) {
      return next(new appError("Incorrect email or password", 401));
    }

    await createSendToken(findUser, 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.cookie("accessToken", "loggedout", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.cookie("refreshToken", "loggedout", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  } catch (error: Error | any) {
    return next(new appError(error.message || "Failed to get user", 500));
  }
};

export { register, login, logout, getMe, createSendToken };
