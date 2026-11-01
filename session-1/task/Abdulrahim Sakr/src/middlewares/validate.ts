import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";

/**
 * Request validation middleware factory using Zod.
 *
 * Validates any combination of req.body, req.params, and req.query
 * against the provided Zod schemas.
 *
 * Why Zod?
 * - Runtime type validation with TypeScript inference
 * - Detailed, structured error messages
 * - Works with both strict and partial schemas
 * - Zero dependencies
 *
 * Usage:
 *   router.post("/users", validate({ body: createUserSchema }), handler);
 *   router.get("/users/:id", validate({ params: idParamSchema }), handler);
 */
interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Array<{ source: string; field: string; message: string }> =
      [];

    const sourcesToValidate: Array<{ name: string; schema: ZodSchema }> = [];

    if (schemas.body)
      sourcesToValidate.push({ name: "body", schema: schemas.body });
    if (schemas.params)
      sourcesToValidate.push({ name: "params", schema: schemas.params });
    if (schemas.query)
      sourcesToValidate.push({ name: "query", schema: schemas.query });

    for (const { name, schema } of sourcesToValidate) {
      const dataToValidate = req[name as keyof ValidationSchemas];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const fieldName = issue.path.join(".");
          errors.push({
            source: name,
            field: fieldName,
            message: issue.message,
          });
        }
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    next();
  };
};
