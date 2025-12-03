const ApiError = require('../utils/apiError')

module.exports = (schema) => (req, _res, next) => {
  if (req.method === 'OPTIONS') return next()

  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    })
    return next()
  } catch (err) {
    const message = err?.errors?.[0]?.message || 'Validation error'
    return next(new ApiError(400, message))
  }
}
