import { z } from "zod";

export const createShopSchema = z.object({
  name: z.string().min(2, "اسم المتجر يجب أن يكون حرفين على الأقل"),
  description: z.string().min(5, "وصف المتجر يجب أن يكون 5 أحرف على الأقل"),
  tagline: z.string().optional(),
});

export const updateShopSettingsSchema = z.object({
  tagline: z.string().optional(),
  description: z.string().optional(),
  settings: z
    .object({
      branding: z
        .object({
          logo: z.string().optional(),
          coverImage: z.string().optional(),
          showTestimonials: z.boolean().optional(),
          showFaqs: z.boolean().optional(),
          showStatistics: z.boolean().optional(),
        })
        .optional(),
      contactInfo: z
        .object({
          whatsappNumber: z.string().optional(),
          instagramProfile: z.string().optional(),
          facebookProfile: z.string().optional(),
          storeAddress: z.string().optional(),
          phoneNumber: z.string().optional(),
          email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
          workingHours: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
