module.exports = (err, _req, res, _next) => {
  const status = err.statusCode || 500
  res.status(status).json({
    ok: false,
    message: err.message || 'Server error'
  })
}
