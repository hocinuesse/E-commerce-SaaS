import productModel from "../models/productModul";
import { Response, NextFunction } from "express";
import appError from "../utils/appError";
import shopModel from "../models/shopModul";

const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const shopId = req.user?.shopId;

    if (!shopId) {
      return next(new appError("shop dont exist", 401));
    }
    const {
      name,
      description,
      tagline,
      longDescription,
      price,
      category,
      discountPrice,
      images,
      stock,
      options,
      specs,
      highlights,
      offers,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      stock === undefined ||
      longDescription === undefined ||
      tagline === undefined ||
      !specs
    ) {
      return next(
        new appError(
          "name, description, price, category, images and stock and longDescription and tagline and specs are required",
          400,
        ),
      );
    }

    const shop = await shopModel.findById(shopId);
    if (!shop) {
      return next(new appError("Shop not found", 404));
    }

    const product = await productModel.create({
      shop: shopId,
      name,
      description,
      longDescription,
      tagline,
      specs,
      highlights,
      price,
      category,
      discountPrice,
      images,
      stock,
      options,
      offers,
    });

    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new appError("Product id is required", 400));
    }
    const product = await productModel.findById(id);
    if (!product) {
      return next(new appError("Product not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return next(new appError("shopId is required", 401));
    }
    const shopExists = await shopModel.findOne({ _id: shopId });
    if (!shopExists) {
      return next(new appError("Shop not found", 404));
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const products = await productModel
      .find({ shop: shopId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const activeProducts = products.filter(
      (product) => product.isActive === true,
    );

    res.status(200).json({
      status: "success",
      results: activeProducts.length,
      data: {
        products,
        productsCount: activeProducts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { category, search } = req.query;

    let filter: any = { isActive: true };

    if (category === "الكل" || category === "all" ? null : category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    filter.isActive = true;

    const activeShops = await shopModel
      .find({ isActive: true })
      .distinct("_id");

    const products = await productModel
      .find({ ...filter, shop: { $in: activeShops } })
      .skip(skip)
      .limit(limit)
      .populate("shop", "name slug owner isActive");

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const updateProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const shopId = req.user?.shopId;
    const {
      name,
      description,
      longDescription,
      price,
      category,
      discountPrice,
      images,
      options,
      stock,
      highlights,
      specs,
      offers,
    } = req.body;

    if (!id) {
      return next(new appError("Product id is required", 400));
    }

    if (!shopId) {
      return next(new appError("Shop id is required", 401));
    }

    const product = await productModel.findOne({
      _id: id,
      shop: shopId,
    });

    if (!product) {
      return next(new appError("Product not found", 404));
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (longDescription) product.longDescription = longDescription;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (images) product.images = images;
    if (options) product.options = options;
    if (stock !== undefined) product.stock = stock;
    if (highlights) product.highlights = highlights;
    if (specs) product.specs = specs;
    if (offers) product.offers = offers;

    await product.save();

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error: Error | any) {
    next(new appError(error.message || "Failed to update product", 400));
  }
};

const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const shopId = req.user?.shopId;

    if (!id) {
      return next(new appError("Product id is required", 400));
    }

    if (!shopId) {
      return next(new appError("Shop id is required", 401));
    }

    const product = await productModel.findOneAndDelete({
      _id: id,
      shop: shopId,
    });

    if (!product) {
      return next(new appError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error: Error | any) {
    next(new appError(error.message || "Failed to delete product", 400));
  }
};

const createReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { rating, comment, name } = req.body;

    if (!productId || !rating || !comment || !name) {
      return next(
        new appError("Product ID, rating, comment, and name are required", 400),
      );
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return next(new appError("Product not found", 404));
    }

    const newReview = {
      name,
      rating,
      comment,
      createdAt: new Date(),
    };
    product.reviews.push(newReview);
    product.ratingCount = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.ratingCount;

    await product.save();

    res.status(201).json({
      status: "success",
      message: "Review added successfully",
      data: {
        review: newReview,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getProductReviews = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findById(productId);
    if (!product) {
      return next(new appError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        reviews: product.reviews,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getCategories = async (req: any, res: Response, next: NextFunction) => {
  try {
    const categories = await productModel.distinct("category");
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getDealsProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await productModel
      .find({
        $AND: [
          {
            $OR: [
              { discountPrice: { $exists: true, $ne: null } },
              { offers: { $exists: true, $ne: null } },
            ],
          },
          { isActive: true },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

const getNewArrivals = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;

    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const parsedLimit = parseInt(limit as string) || 10;
    const safeLimit = Math.min(Math.max(1, parsedLimit), 50);

    const products = await productModel
      .find({
        isActive: true,
        createdAt: { $gte: date30DaysAgo },
      })
      .sort({ createdAt: -1 })
      .limit(safeLimit);
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error: Error | any) {
    next(error);
  }
};

export {
  createProduct,
  getShopProducts,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  createReview,
  getProductReviews,
  getCategories,
  getDealsProducts,
  getNewArrivals,
};
