import { Router } from "express";
import protect from "../middlewares/protect";
import { logout , register , login, getMe } from "../controllers/authController";
import asyncWrapper from "../utils/asyncWrapper";
import refreshCookieToken from "../controllers/refrechCookieToken";

const router = Router();

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));
router.post("/logout", asyncWrapper(logout));
router.post("/refresh-token", refreshCookieToken);
router.get("/me", protect, asyncWrapper(getMe));

export default router;