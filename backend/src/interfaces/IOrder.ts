import { IProductInCart } from './ICart';
import { Document, Types } from "mongoose";
import { OrderMethod } from "./IShop";
import { OrderStatus } from "./ICart";

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IProductInCart[];
  shop: Types.ObjectId;
  shippingAddress: {
    fullName: string;
    phone: string;
    wilaya: string;
    baladiya: string;
    addressDetail?: string;
    shippingType?: ShippingType;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: OrderMethod;
  cartId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


export enum ShippingType {
  HOME = "home",
  DESK = "desk",
  PICKUP = "pickup"
}