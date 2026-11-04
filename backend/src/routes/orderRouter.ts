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
import { validate } from "../middlewares/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/orderValidation";

const router = Router();

router.post(
  "/create-order",
  protect,
  authorizedRoles(UserRole.CLIENT),
  validate({ body: createOrderSchema }),
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
  authorizedRoles(UserRole.VENDOR, UserRole.ADMIN),
  getShopOrders,
);
router.patch(
  "/update-order-status/:orderId",
  protect,
  authorizedRoles(UserRole.VENDOR, UserRole.ADMIN),
  validate({ body: updateOrderStatusSchema }),
  updateOrderStatus,
);

export default router;
