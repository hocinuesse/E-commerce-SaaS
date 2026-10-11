import { IProduct } from "./IProduct";

interface IProductInCart {
  _id: string;
  product: IProduct;
  quantity: number;
  price: number;
  options?: ProductOption[];
  shopId: string;
}

interface ProductOption {
  name: string;
  values: string[];
}

interface ICart {
  _id: string;
  user: string;
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
  CANCELLED = "cancelled",
}

export type { ICart, IProductInCart };
