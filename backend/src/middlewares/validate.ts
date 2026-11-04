import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Express middleware generator that validates request data against Zod schemas.
 * Validates body, query, and params as configured.
 */
export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          status: "fail",
          message: "خطأ في التحقق من صحة البيانات المدخلة (Validation Error)",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
