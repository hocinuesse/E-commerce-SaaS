import { Document, Types } from "mongoose";
import { IReviews } from "./IShop";
export interface IProduct extends Document {
  shop: Types.ObjectId;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  discountPrice?: number;
  images: string[];
  stock: number;
  rating?: number;
  offers?: {
    name: string;
    value: string;
    endsAt: Date;
  }[];
  ratingCount?: number;
  badge?: string;
  options?: {
    name: string;
    values: string[];
  }[];
  faqs?: short[];
  specs?: short[];
  highlights?: short[];
  reviews: IReviews[];
  isActive: boolean;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface short {
  name: string;
  value: string;
}
