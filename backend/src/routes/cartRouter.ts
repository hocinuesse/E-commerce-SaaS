import { Router } from "express";
import addToCart from "../controllers/addCart"
import { getCart, removeFromCart, updateCartItemQuantity } from "../controllers/getCart";
import asyncWrapper from "../utils/asyncWrapper";
import optionalProtect from "../middlewares/optionalProtect";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";
const router = Router();

router.post("/add", optionalProtect, authorizedRoles(UserRole.CLIENT), asyncWrapper(addToCart));
router.get("/", optionalProtect, authorizedRoles(UserRole.CLIENT), asyncWrapper(getCart));
router.delete("/delete/:id", optionalProtect, authorizedRoles(UserRole.CLIENT), asyncWrapper(removeFromCart));
router.patch("/update", optionalProtect, authorizedRoles(UserRole.CLIENT), asyncWrapper(updateCartItemQuantity));

export default router;