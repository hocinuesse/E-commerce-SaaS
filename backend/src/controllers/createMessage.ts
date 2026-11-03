import { Request, Response, NextFunction } from "express";
import messageModel from "../models/messagesModul";
import appError from "../utils/appError";
import shopModel from "../models/shopModul";
import { UserRole } from "../interfaces/IUser";
import { notifyNewMessage } from "../utils/socket";

const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { senderName, senderPhone, message, shopId } = req.body;

    if (!senderName || !senderPhone || !message || !shopId) {
      return next(new appError("All fields are required", 400));
    }

    const shopExists = await shopModel.findById(shopId);
    if (!shopExists) {
      return next(new appError("Shop not found", 404));
    }

    const newMessage = await messageModel.create({
      senderName,
      senderPhone,
      message,
      shopId,   
    });

    try {
      notifyNewMessage(shopId.toString(), newMessage);
    } catch (err) {
      // Socket emission error should not affect response
    }

    res.status(201).json({
      status: "success",
      data: newMessage,
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getMessagesByShop = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return next(new appError("Shop ID is required", 400));
    }

    const user = req.user;
    const isOwner = user?.shopId?.toString() === shopId.toString();
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(
        new appError("You are not authorized to view messages for this shop", 403),
      );
    }

    const messages = await messageModel
      .find({ shopId: shopId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const markMessageAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return next(new appError("Message ID is required", 400));
    }

    const message = await messageModel.findById(messageId);
    if (!message) {
      return next(new appError("Message not found", 404));
    }

    const user = req.user;
    const isOwner = user?.shopId?.toString() === message.shopId.toString();
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(
        new appError("You are not authorized to modify this message", 403),
      );
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const deleteMessage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return next(new appError("Message ID is required", 400));
    }

    const message = await messageModel.findById(messageId);
    if (!message) {
      return next(new appError("Message not found", 404));
    }

    const user = req.user;
    const isOwner = user?.shopId?.toString() === message.shopId.toString();
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(
        new appError("You are not authorized to delete this message", 403),
      );
    }

    await messageModel.findByIdAndDelete(messageId);

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

export { createMessage, markMessageAsRead, getMessagesByShop, deleteMessage };
