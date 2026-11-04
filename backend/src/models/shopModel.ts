import mongoose, { Schema } from "mongoose";
import {
  IShop,
  currency,
  IReviews,
  OrderMethod,
  ShopStatus,
} from "../interfaces/IShop";
import slugify from "slugify";

const reviewSchema = new Schema<IReviews>({
  name: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const shopSchema: Schema<IShop> = new Schema(
  {
    name: {
      type: String,
      required: [true, "A shop must have a name"],
      unique: true,
      maxlength: [50, "A shop name must have less or equal than 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "A shop must have a slug"],
    },
    tagline: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A shop must have a description"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A shop must belong to an owner (Vendor)"],
      unique: true,
    },
    currency: {
      type: String,
      required: [true, "A shop must have a currency"],
      default: currency.SAR,
    },
    faqs: {
      name: String,
      value: String
    },
    settings: {
      branding: {
        logo: String,
        showTestimonials: { type: Boolean, default: true },
        showFaqs: { type: Boolean, default: true },
        showStatistics: { type: Boolean, default: true },
        coverImage: { type: String },
      },

      contactInfo: {
        whatsappNumber: String,
        instagramProfile: String,
        facebookProfile: String,
        storeAddress: String,
        phoneNumber: String,
        email: String,
        workingHours: String,
      },
    },

    googleMapsLink: String,
    reviews: [reviewSchema],
    orderMethod: {
      type: String,
      enum: Object.values(OrderMethod),
      default: OrderMethod.NONE,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ShopStatus,
      default: ShopStatus.PENDING,
    },
    shippingNote: {
      type: String,
      default: "No shipping note provided.",
    },
  },
  { timestamps: true },
);

shopSchema.pre<IShop>("save", function () {
  if (this.isModified("name")) {
    if (!this.slug) {
      const hasArabic = /[\u0600-\u06FF]/.test(this.name);
      if (hasArabic) {
        this.slug = this.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s\u0600-\u06FF-]/g, "")
          .replace(/\s+/g, "-");
      } else {
        this.slug = slugify(this.name, {
          lower: true,
          strict: true,
        });
      }
    }
  }
});

const shopModel = mongoose.model<IShop>("Shop", shopSchema, "shops");
export default shopModel;
