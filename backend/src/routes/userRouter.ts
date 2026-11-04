import { Router } from "express";
import protect from "../middlewares/protect";
import { logout, register, login, getMe } from "../controllers/authController";
import asyncWrapper from "../utils/asyncWrapper";
import refreshCookieToken from "../controllers/refreshCookieToken";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validations/authValidation";

const router = Router();

router.post("/register", validate({ body: registerSchema }), asyncWrapper(register));
router.post("/login", validate({ body: loginSchema }), asyncWrapper(login));
router.post("/logout", asyncWrapper(logout));
router.post("/refresh-token", refreshCookieToken);
router.get("/me", protect, asyncWrapper(getMe));

export default router;
