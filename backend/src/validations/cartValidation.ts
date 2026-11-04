import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "معرّف المنتج مطلوب"),
  quantity: z.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  options: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional(),
});
