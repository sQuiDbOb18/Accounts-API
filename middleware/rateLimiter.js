const rateLimit = require(`express-rate-limit`)

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: `error`,
    message: `Too many requests. Please try again later.`
  },
  standardHeaders: true,
  legacyHeaders: false,
})


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: `error`,
    message: `Too many login attempts. Try again later.`
  }
})

module.exports = {
  apiLimiter,
  loginLimiter  
}