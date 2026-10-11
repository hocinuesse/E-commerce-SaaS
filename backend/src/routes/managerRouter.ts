import { Router } from "express";
import {
  getAllManagers,
  createManager,
  deleteManager,
  toggleProductVisibility,
  updatingQuantity,
} from "../controllers/createManager";
import protect from "../middlewares/protect";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";
import asyncWrapper from "../utils/asyncWrapper";

const router = Router();

router.post(
  "/create-manager",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(createManager),
);

router.get(
  "/my-managers",
  protect,
  authorizedRoles(UserRole.VENDOR),
  asyncWrapper(getAllManagers),
);
router.delete("/delete-manager/:id", protect, authorizedRoles(UserRole.VENDOR), asyncWrapper(deleteManager));
router.patch("/visibility/:id", protect, authorizedRoles(UserRole.MANAGER , UserRole.VENDOR), asyncWrapper(toggleProductVisibility));
router.patch("/stock/:id", protect, authorizedRoles(UserRole.MANAGER , UserRole.VENDOR), asyncWrapper(updatingQuantity));




export default router;
