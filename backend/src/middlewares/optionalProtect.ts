import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";

const optionalProtect = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if ( req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        phone: decoded.phone,
      };
      next();
    } catch (err) {
      return next();
    }
  } catch (err) {
    next(new appError("Invalid token", 401));
  }
};

export default optionalProtect;
