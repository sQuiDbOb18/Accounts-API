const customError = require('./customError')
const jwt = require('jsonwebtoken')
const Account = require('../models/account.model')

async function protect(req, res, next){
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token){
      return next(new customError('No token provided', 401))
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.ACCESS_SECRET)
    } catch (err) {
      return next(new customError('Invalid or expired token', 401))
    }

    const account = await Account.findById(decoded._id).select(`+password +refreshTokens`)
    if (!account){
      return next(new customError('Account not found', 404))
    }

    req.account = account
    next()
    
  } catch (err) {
    next(err)
  }
}

const authRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.account.role)){
      return next(new customError(`Forbidden: Access denied!`, 403))
    }
    next()
  }
}

module.exports = {
  protect, 
  authRoles 
}