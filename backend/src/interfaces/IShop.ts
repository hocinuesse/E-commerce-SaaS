import mongoose, { Document } from "mongoose";
import { short } from "./IProduct";

export enum ShopStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum OrderMethod {
  COD = "COD",
  CARD = "CARD",
  // ONLINE = "ONLINE",
  BOTH = "BOTH",
  NONE = "NONE",
}

export enum currency {
  USD = "USD",
  EUR = "EUR",
  SAR = "SAR",
  AED = "AED",
}

export interface IReviews {
  name: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

export interface IShop extends Document {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  currency: currency;

  settings: {
    branding: {
      logo?: string;
      coverImage?: string;
      showTestimonials: boolean;
      showFaqs: boolean;
      showStatistics: boolean;
    };

    contactInfo: {
      whatsappNumber?: string;
      instagramProfile?: string;
      facebookProfile?: string;
      storeAddress?: string;
      phoneNumber?: string;
      email?: string;
      workingHours?: string;
    };
  };

  googleMapsLink?: string;
  faqs: short[];
  reviews: IReviews[];
  rating?: number;
  ratingCount?: number;
  orderMethod: OrderMethod;
  isActive: boolean;
  viewCount: number;
  status: ShopStatus;
  shippingNote: string;
  createdAt: Date;
}
