function logger(req, res, next ){
  const requestTime = new Date().toLocaleString()
  console.log(`[${requestTime}] ${req.method} ${req.url} `)
  next()
}

module.exports = logger