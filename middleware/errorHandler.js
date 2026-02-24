const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({
    success: false,
    msg: err.message || 'Something went wrong',
  }) 
}

module.exports = errorHandler