import { Schema, model } from "mongoose";
import { IProduct } from "../interfaces/IProduct";
import slugify from "slugify";
import shopModel from "./shopModul";

const productSchema = new Schema<IProduct>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "A product must belong to a shop"],
    },
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },
    tagline: {
      type: String,
      required: [true, "A product must have a tagline"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "A product price must be greater than or equal to 0"],
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
      trim: true,
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (this: any, value: number) {
          return value < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    images: {
      type: [String],
      default: ["/default-product-image.jpg"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    badge: {
      type: String,
    },
    faqs: {
      name: String,
      value: String,
    },
    offers: [
      {
        name: String,
        value: String,
        endsAt: Date,
      },
    ],
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    options: [
      {
        name: { type: String, required: true },
        values: { type: [String], required: true },
      },
    ],
    highlights: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    specs: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    reviews: [
      {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      default: true,
      type: Boolean,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.index({ shop: 1, slug: 1 }, { unique: true });

productSchema.pre("save", function () {
  if (!this.isModified("name")) return;
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
});

const productModel = model<IProduct>("Product", productSchema, "products");

export default productModel;
