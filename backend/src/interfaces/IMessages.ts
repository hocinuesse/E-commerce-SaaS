import mongoose from "mongoose";

export interface IMessage {
    senderName: string;
    senderPhone: string;
    message: string;
    createdAt: Date;
    isRead: boolean;
    shopId: mongoose.Types.ObjectId;
}