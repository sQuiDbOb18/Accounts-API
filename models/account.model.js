const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const deviceTokenSchema = new mongoose.Schema({
  deviceId: String,
  refreshToken: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
})

const accountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
 
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    age: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: [`user`, `admin`, `manager`],
      default: `user`
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    loginOTP: String,
    loginOTPExpire: Date,
    loginOTPEndAt: Number,
    restoreToken: String,
    restoreTokenExpire: Date,

    refreshTokens: [ deviceTokenSchema ],
  },
  { timestamps: true }
)

accountSchema.index({firstName: 1, lastName: 1}, {unique: true})

accountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next
  this.password = await bcrypt.hash(this.password, 12) 
  next
})

accountSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

accountSchema.methods.createDeviceRefreshToken = function (deviceId) {
  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto 
    .createHash('sha256')
    .update(token)
    .digest('hex')
 
  this.refreshTokens.push({
    deviceId,
    refreshToken: hashedToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })
  return token
}

accountSchema.methods.rotateRefreshToken = function(hashedToken) {
  this.refreshTokens = this.refreshTokens.filter(
    t => t.refreshToken !== hashedToken
  )
}

accountSchema.methods.logoutDevice = function(deviceId) {
  this.refreshTokens = this.refreshTokens.filter(
    t => t.deviceId !== deviceId
  )
} 

accountSchema.methods.createResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex')
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex')
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
  return rawToken
}

accountSchema.methods.createLoginOTP = function () {
  const otp = Math.floor(10000 + Math.random() * 90000)
  this.loginOTP = crypto
    .createHash(`sha256`)
    .update(otp.toString())
    .digest(`hex`)
  this.loginOTPExpire = new Date(
    Date.now() + 5 * 60 * 1000
  )
  return otp
}

accountSchema.methods.createRestoreToken = function () {
  const token = crypto.randomBytes(32).toString(`hex`)
  this.restoreToken = crypto
    .createHash(`sha256`)
    .update(token)
    .digest(`hex`)
  this.restoreTokenExpire = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000 
  )
  return token
}

module.exports = mongoose.model('Account', accountSchema)