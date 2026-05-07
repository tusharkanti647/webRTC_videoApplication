// middlewares/validate.middleware.js

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // attach clean data
    req.validatedData = parsed;

    next();
  } catch (err) {
    console.log('hhhhh', err);
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors,
    });
  }
};
