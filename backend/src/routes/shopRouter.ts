import {
  createShop,
  getShopBySlug,
  getMyShop,
  getAllShops,
  getShopById,
  totalSalesReport,
  viewCount,
  getMonthlySalesReport,
  updateShopSettings,
  createReview,
  getProductReviews,
} from "../controllers/createShop";
import { Router } from "express";
import protect from "../middlewares/protect";
import asyncWrapper from "../utils/asyncWrapper";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";

const router = Router();

router.get("/shop/:slug", asyncWrapper(getShopBySlug));
router.get("/all-shops", getAllShops);
router.post(
  "/create-shop",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(createShop),
);
router.get(
  "/my-shop",
  protect,
  authorizedRoles(UserRole.VENDOR, UserRole.MANAGER),
  asyncWrapper(getMyShop),
);
router.get("/shop-id/:id", protect, asyncWrapper(getShopById));
router.post(
  "/total-sales-report",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(totalSalesReport),
);
router.post("/view-count/:shopSlug", asyncWrapper(viewCount));
router.post(
  "/monthly-sales-report",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(getMonthlySalesReport),
);
router.patch(
  "/update-shop-settings/:shopId",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(updateShopSettings),
);

router.post(
  "/add-review/:shopId",
  protect,
  asyncWrapper(createReview),
);

router.get(
  "/shop-reviews/:shopId",
  asyncWrapper(getProductReviews),
);


export default router;
