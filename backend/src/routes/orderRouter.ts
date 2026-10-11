import { Router } from "express";
import protect from "../middlewares/protect";
import {
  createOrder,
  getShopOrders,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/createOrder";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";

const router = Router();

router.post(
  "/create-order",
  protect,
  authorizedRoles(UserRole.CLIENT),
  createOrder,
);
router.get(
  "/user-orders",
  protect,
  authorizedRoles(UserRole.CLIENT),
  getUserOrders,
);
router.get(
  "/shop-orders",
  protect,
  authorizedRoles(UserRole.VENDOR),
  getShopOrders,
);
router.patch(
  "/update-order-status/:orderId",
  protect,
  authorizedRoles(UserRole.VENDOR),
  updateOrderStatus,
);

export default router;
