import protect from "../middlewares/protect";
import { Router } from "express";
import {
  updateShopsStatus,
  getAllShops,
  getShopDetails,
  totalUsers,
  totalOrders,
  getPlatformStats,
  getBestSellers,
} from "../controllers/admin";
import { UserRole } from "../interfaces/IUser";
import authorizedRoles from "../middlewares/authorizedRoles";
import asyncWrapper from "../utils/asyncWrapper";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";

const router = Router();

router.get("/platform-stats", cacheMiddleware(60), asyncWrapper(getPlatformStats));
router.get("/best-sellers", cacheMiddleware(60), asyncWrapper(getBestSellers));
router.use(protect, authorizedRoles(UserRole.ADMIN));
router.get("/shops", asyncWrapper(getAllShops));
router.get("/shops/:shopId", asyncWrapper(getShopDetails));
router.patch("/shops/:shopId/status", asyncWrapper(updateShopsStatus));
router.get("/users", asyncWrapper(totalUsers));
router.get("/orders", asyncWrapper(totalOrders));

export default router;
