import { IMessage } from "../interfaces/IMessages";
import { Schema, model } from "mongoose";

const messageSchema = new Schema<IMessage>(
  {
    senderName: { type: String, required: true },
    senderPhone: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  { timestamps: true },
);

const messageModel = model<IMessage>("Message", messageSchema, "messages");
export default messageModel;
