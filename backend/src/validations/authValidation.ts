import { z } from "zod";
import { UserRole } from "../interfaces/IUser";

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone: z
    .string()
    .regex(/^[0-9+\s-]{9,15}$/, "رقم الهاتف غير صالح"),
  role: z.nativeEnum(UserRole, { message: "نوع الحساب غير صالح" }),
  vendorInfo: z
    .object({
      storeName: z.string().min(2, "اسم المتجر مطلوب للبائع"),
      commercialRegister: z.string().optional(),
    })
    .optional(),
}).refine(
  (data) => {
    if (data.role === UserRole.VENDOR) {
      return !!data.vendorInfo && !!data.vendorInfo.storeName;
    }
    return true;
  },
  {
    message: "بيانات المتجر مطلوبة لحسابات البائعين",
    path: ["vendorInfo"],
  }
);

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
