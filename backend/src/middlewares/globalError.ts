import { Request, Response, NextFunction } from "express";

const globalError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = error.statusCode || 500;
  let status = error.status || "error";
  let message = error.message || "Internal Server Error";

  // Mongoose CastError (e.g. invalid ObjectId in params)
  if (error.name === "CastError") {
    statusCode = 400;
    status = "fail";
    message = `Invalid resource identifier: ${error.value}`;
  }

  // Mongoose Duplicate Key Error
  if (error.code === 11000) {
    statusCode = 400;
    status = "fail";
    const field = Object.keys(error.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    const errors = Object.values(error.errors || {}).map((el: any) => el.message);
    message = `Validation Error: ${errors.join(". ")}`;
  }

  // JWT Errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    status = "fail";
    message = "Invalid token. Please log in again.";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Your token has expired. Please log in again.";
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    status,
    message,
    statusCode,
    ...(isProduction ? {} : { stack: error.stack, error }),
  });
};

export default globalError;
