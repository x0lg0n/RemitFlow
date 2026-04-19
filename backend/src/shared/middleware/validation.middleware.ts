import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/** Express middleware that validates req.body against a Zod schema. */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: firstError.message,
        },
      });
      return;
    }
    // Replace body with the parsed/typed result.
    req.body = result.data;
    next();
  };
}
