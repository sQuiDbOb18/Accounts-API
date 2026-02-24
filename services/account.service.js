const crypto = require(`crypto`)
const repo = require(`../repositories/account.repository`)
const generateAccessToken = require(`../utils/generateAccessToken`)
const customError = require(`../middleware/customError`)

exports.getAllAccounts = async (req) => {
  const accounts = await repo.getAccounts(
    {
      ...req.filter,
      ...req.searchQuery,
      _id: { $ne: req.account.id }
    },
    {
      select: req.select,
      sort: req.sort,
      skip: req.pagination.skip,
      limit: req.pagination.limit
    }
  )
  return({
    total: accounts.length,
    data: accounts
  })
}

exports.getAccountByIdentifier = async ({email, phone}) => {
  if (!email && !phone){
    throw new customError(`Provide email or phone number`, 400)
  }
  const account = await repo.findByEmailOrPhone({email, phone})
  if (!account){
    throw new customError(`Account not found`, 404)
  }
  
  return account
}

exports.getMyAccount = async (accountId) => {
  return repo.findById(accountId)
}

exports.register = async (data, deviceId) => {
  const { email, phone } = data
  const identifier = email || phone
  const existing = await repo.findByIdentifier(identifier)
  if (existing){
    throw new customError(`Account already exists`, 403)
  }

  const account = await repo.create(data)

  const accessToken = generateAccessToken(account)
  const refreshToken = account.createDeviceRefreshToken(deviceId)

  await account.save()

  return { accessToken, refreshToken }
}

exports.login = async ({ identifier, password }, deviceId) => {
  const account = await repo.findByIdentifier(identifier)
  if (!account){
    throw new customError(`Invalid credentials`, 400)
  }

  const valid = await account.matchPassword(password)
  if (!valid){
    throw new customError(`Incorrect password`, 400)
  }
  
  const accessToken = generateAccessToken(account)
  const refreshToken = account.createDeviceRefreshToken(deviceId)

  await account.save()

  return { accessToken, refreshToken }
}

exports.refreshAccessToken = async (refreshToken, deviceId) => {
  const hashed = crypto
    .createHash(`sha256`)
    .update(refreshToken)
    .digest(`hex`)
  
  const account = await repo.findByRefreshToken(hashed)
  if (!account){
    throw new customError(`Refresh token re-use detected. Device logged out`, 400)
  }

  const deviceToken = account.refreshTokens.find(
    t => t.refreshToken === hashed
  )
  if (!deviceToken || deviceToken.expiresAt < Date.now()){
    throw new customError(`Refresh token expired`, 400)
  }

  account.rotateRefreshToken(hashed)

  const newRefreshToken = account.createDeviceRefreshToken(deviceId)
  const accessToken = generateAccessToken(account)

  await account.save()

  return { accessToken, refreshToken: newRefreshToken }
}

exports.logout = async (accountId, deviceId) => {
  const account = await repo.findById(accountId)
  account.logoutDevice(deviceId)
  await account.save()
}

exports.forgotPassword = async ({identifier}) => {
  const account = await repo.findByIdentifier(identifier)
  if (!account){
    throw new customError(`Account not found`, 404)
  }
  const resetToken = account.createResetPasswordToken()

  await account.save({ validateBeforeSave: false })

  return { resetToken }
}

exports.resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto
    .createHash(`sha256`)
    .update(rawToken)
    .digest(`hex`) 
  
  const account = await repo.findByResetToken(hashedToken)
  if (!account){
    throw new customError(`Invalid or expired reset token`, 400)
  }

  const samePassword = await account.matchPassword(newPassword)
  if (samePassword){
    throw new customError(`Choose a different password`, 403)
  }

  account.password = newPassword

  account.resetPasswordToken = undefined
  account.resetPasswordExpire = undefined

  account.refreshTokens = []

  await account.save()
}

exports.updateAccount = async (accountId, updatedData) => {
  const forbiddenFields = [`password`, `role`, `refreshToken`, `refreshTokens`]
  const attemptedFields = Object.keys(updatedData)
  const forbiddenAttempt = attemptedFields.find((field) => forbiddenFields.includes(field))
  if (forbiddenAttempt){
    throw new customError(`You are not allowed to update ${forbiddenFields} from this route`, 400)
  }

  const account = await repo.updateById(accountId, updatedData)
  if (!account){
    throw new customError(`Account not found`, 404)
  }

  const accessToken = generateAccessToken(account)
  const refreshToken = account.createDeviceRefreshToken()

  return { 
    account, 
    accessToken,
    refreshToken
  }
}

exports.changePassword = async (accountId, {oldPassword, newPassword}) => {
  if (!oldPassword || !newPassword){
    throw new customError(`Provide old and new password`, 400)
  }

  const account = await repo.findById(accountId) 

  const isMatch = await account.matchPassword(oldPassword)
  if (!isMatch){
    throw new customError(`Incorrect old password`, 400)
  }

  const samePassword = await account.matchPassword(newPassword)
  if (samePassword){
    throw new customError(`New password must not be the same with old password`, 400)
  }

  account.password = newPassword
  
  await account.save()
}

exports.requestOTP = async ({identifier}) => {
  if (!identifier){
    throw new customError(`Provide email or phone number`, 400)
  }

  const account = await repo.findByIdentifier(identifier)
  if (!account){
    throw new customError(`Account not found`, 404)
  }
  
  function formatMMSS(totalSeconds){
    if (totalSeconds < 0) totalSeconds = 0
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    const mm = String(m).padStart(2, `0`)
    const ss = String(s).padStart(2, `0`)
    return `${mm}:${ss}`
  }
  const coolDownMs = 2 * 60 * 1000
  const coolDownUntil = Date.now() + coolDownMs
  if (account.loginOTPEndAt && Date.now() < account.loginOTPEndAt){
    const remainingMs = account.loginOTPEndAt - Date.now()
    const remainingSec = Math.ceil(remainingMs / 1000)
    throw new customError(`Please wait ${formatMMSS(remainingSec)} before requesting a new OTP`, 429) 
  }
  
  const otp = account.createLoginOTP()
  account.loginOTPEndAt = coolDownUntil

  await account.save()

  return { otp }
}

exports.verifyOTP = async ({ identifier, otp }, deviceId) => {
  if (!identifier){
    throw new customError(`Provide email or phone number`, 400)
  }
  if (otp === undefined || otp === null){
    throw new customError(`OTP is required`, 400)
  }
  const hashed = crypto
    .createHash(`sha256`)
    .update(String(otp))
    .digest(`hex`)

  const account = await repo.findByOTP(hashed, identifier)
  if (!account){
    throw new customError(`Invalid or expired otp`, 400)
  }

  account.loginOTP = undefined
  account.loginOTPEndAt = undefined
  account.loginOTPExpire = undefined

  const accessToken = generateAccessToken(account)
  const refreshToken = account.createDeviceRefreshToken(deviceId)

  await account.save()

  return { accessToken, refreshToken }
}

exports.softDeleteAccount = async ({ email }) => {
  if (!email){
    throw new customError(`Email is required`, 400)
  }
  
  const account = await repo.softDeleteAccount(email)
  if (!account){
    throw new customError(`Account not found`, 404)
  }

  if (
    account.role === `user` &&
    account.email !== email
  ) {
    throw new customError(`You are not allowed to delete this account`, 403)
  }

  account.isDeleted = true
  account.deletedAt = new Date()

  account.refreshTokens = []

  const restoreToken = account.createRestoreToken()

  await account.save()

  return { restoreToken }
}

exports.restoreAccount = async ({ identifier, token }) => {
  if (!token){
    throw new customError(`Token is required`)
  }
  if (!identifier){
    throw new customError(`Provide email or phone number`, 400)
  }
  const hashed = crypto
    .createHash(`sha256`)
    .update(token)
    .digest(`hex`)
  
  const account = await repo.findByRestoreToken( hashed, identifier )
  if (!account){
    throw new customError(`Invalid or expired refresh token`, 400)
  }

  account.isDeleted = false
  account.deletedAt = null
  account.restoreToken = undefined
  account.restoreTokenExpire = undefined

  await account.save()
}