import { Router } from "express";
import {
  createProduct,
  getShopProducts,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  createReview,
  getProductReviews,
  getCategories,
  getDealsProducts,
  getNewArrivals
} from "../controllers/createProduct";
import protect from "../middlewares/protect";
import asyncWrapper from "../utils/asyncWrapper";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";

const router = Router();

router.get(
  "/all-products",
  asyncWrapper(getProducts),
);
router.get(
  "/product/:id",
  asyncWrapper(getProductById),
);
router.post(
  "/create-product",
  protect,
  authorizedRoles(UserRole.VENDOR, UserRole.MANAGER),
  asyncWrapper(createProduct),
);
router.get(
  "/categories",
  asyncWrapper(getCategories),
);

router.get(
  "/deals",
  asyncWrapper(getDealsProducts),
);

router.get(
  "/new-arrivals",
  asyncWrapper(getNewArrivals),
);

router.get("/:shopId", asyncWrapper(getShopProducts));

router.patch(
  "/update-product/:id",
  protect,
  authorizedRoles(UserRole.VENDOR, UserRole.MANAGER),
  asyncWrapper(updateProduct),
);
router.delete(
  "/delete-product/:id",
  protect,
  authorizedRoles(UserRole.VENDOR, UserRole.MANAGER),
  asyncWrapper(deleteProduct),
);

router.post(
  "/add-review/:productId",
  protect,
  asyncWrapper(createReview),
);

router.get(
  "/product-reviews/:productId",
  asyncWrapper(getProductReviews),
);

export default router;
