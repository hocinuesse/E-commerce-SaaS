import { z } from "zod";
import { OrderStatus } from "../interfaces/ICart";
import { ShippingType } from "../interfaces/IOrder";
import { OrderMethod } from "../interfaces/IShop";

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, "الاسم الكامل مطلوب"),
    phone: z.string().regex(/^[0-9+\s-]{9,15}$/, "رقم الهاتف غير صالح"),
    wilaya: z.string().min(1, "الولاية مطلوبة"),
    baladiya: z.string().min(1, "البلدية مطلوبة"),
    addressDetail: z.string().optional(),
    shippingType: z.nativeEnum(ShippingType).optional().default(ShippingType.HOME),
  }),
  paymentMethod: z.nativeEnum(OrderMethod).optional().default(OrderMethod.COD),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, { message: "حالة الطلب غير صالحة" }),
});
