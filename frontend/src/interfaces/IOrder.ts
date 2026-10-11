import { IProductInCart } from "./ICart";
import { OrderMethod } from "./IProduct";
import { OrderStatus } from "./ICart";

export interface IOrder {
  _id: string;
  user: string;
  items: IProductInCart[];
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
  cartId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShippingType {
  HOME = "home",
  DESK = "desk",
  PICKUP = "pickup",
}
