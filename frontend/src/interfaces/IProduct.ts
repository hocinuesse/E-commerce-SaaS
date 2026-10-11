import { UserRole } from "@/interfaces/IUserStore";


interface ProductOption {
  name: string;
  values: string[];
}


interface IProduct {
  _id: string;
  shop: Shop;
  name: string;
  tagline?: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  category: string;
  discountPrice?: number;
  images: string[];
  badge?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  offers?: {
    name: string;
    value: string;
    endsAt?: Date;
  }[];
  options?: ProductOption[];
  specs?: short[];
  highlights?: short[];
  faqs?: short[];
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


export enum ShopStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum OrderMethod {
  COD = "COD",
  CARD = "CARD",
  BOTH = "BOTH",
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shopId?: Shop;
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
interface Shop {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  owner: Owner;
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
  reviews: IReviews[];
  rating?: number;
  ratingCount?: number;
  orderMethod: OrderMethod;
  isActive: boolean;
  viewCount: number;
  faqs?: short[];
  status: ShopStatus;
  shippingNote: string;
  createdAt: Date;
}

interface CreateProductInput {
  name: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: string;
  description: string;
  tagline: string;
  longDescription: string;
  specs?: short[];
  highlights?: short[];
  faqs?: short[];
  options?: {
    name: string;
    values: string[];
  }[];
  offers?: {
    name: string;
    value: string;
    endsAt?: Date;
  }[];
  images: string[];
}

export interface short {
  name: string;
  value: string;
}




export type { IProduct, CreateProductInput, Shop, ProductOption };
