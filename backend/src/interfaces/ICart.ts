import { Document, Types } from "mongoose";

export interface IProductInCart {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  options?: ProductOption[];
  shop: Types.ObjectId;
}

interface ProductOption {
  name: string;
  values: string[];
}


export interface ICart extends Document {
  user: Types.ObjectId;
  items: IProductInCart[];
  sessionId?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
 export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}