const jwt = require('jsonwebtoken')

const generateAccessToken = (account) => {
  return jwt.sign(
    { _id: account._id, role: account.role, email: account.email},
    process.env.ACCESS_SECRET,
    { expiresIn: '10m'}
  )
} 

module.exports = generateAccessToken