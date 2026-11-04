import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "اسم المنتج يجب أن يحتوي على حرفين على الأقل"),
  description: z.string().min(5, "الوصف القصير يجب أن يكون 5 أحرف على الأقل"),
  tagline: z.string().optional().default(""),
  longDescription: z.string().optional().default(""),
  price: z.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  category: z.string().min(1, "التصنيف مطلوب"),
  discountPrice: z.number().min(0).optional(),
  images: z.array(z.string().url("رابط الصورة غير صالح")).optional().default([]),
  stock: z.number().int().min(0, "المخزون يجب أن يكون عدداً صحيحاً لا يقل عن 0"),
  options: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional(),
  specs: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  highlights: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  offers: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        endsAt: z.coerce.date(),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();
