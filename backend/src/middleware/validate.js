import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace with validated data to strip unknown fields and cast types safely
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map(
        (e) => `${e.path.join(".") || "field"}: ${e.message}`
      );
      return next(new AppError(400, "Validation failed", messages));
    }
    next(err);
  }
};
