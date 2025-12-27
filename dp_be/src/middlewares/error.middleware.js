module.exports = (err, req, res, _next) => {
  console.error('------------------------------------------------')
  console.error(`Error in ${req.method} ${req.originalUrl}`)
  console.error('Message:', err.message)
  console.error('Stack:', err.stack)
  console.error('------------------------------------------------')

  const status = err.statusCode || 500
  res.status(status).json({
    ok: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
