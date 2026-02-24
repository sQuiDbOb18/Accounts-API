const service = require(`../services/account.service`)

exports.register = async ( req, res ) => {
  const deviceId = req.headers[`x-device-id`]

  const data = await service.register(req.body, deviceId)

  res.status(201).json({
    status: `success`,
    data
  })
}

exports.login = async (req, res) => { 
  const deviceId = req.headers[`x-device-id`]
  const { email, phone, password } = req.body
  const identifier = email || phone

  const data = await service.login({ identifier, password }, deviceId)

  res.status(201).json({
    status: `success`,
    data
  })
}

exports.refresh = async (req, res) => {
  const deviceId = req.headers[`x-device-id`]

  const { refreshToken } = req.body

  const data = await service.refreshAccessToken(refreshToken, deviceId)

  res.status(201).json({
    status: `success`,
    data
  })
}

exports.logout = async (req, res) => {
  const deviceId = req.headers[`x-device-id`]

  await service.logout(req.account.id, deviceId)

  res.status(201).json({
    status: `success`,
    message: `Account logged out successfully`
  })
}

exports.getMyAccount = async (req, res) => {
  const data = await service.getMyAccount(req.account.id)
  res.json({
    message: 'Welcome to dashboard',
    account: data
  })
}

exports.forgotPassword = async (req, res) => {
  const { email, phone } = req.body
  const data = await service.forgotPassword({ email, phone })
  res.status(201).json({
    status: `success`,
    message: `Reset instruction sent`,
    data

  })
}

exports.resetPassword = async (req, res) => {
  const { token } = req.params 
  const { password } = req.body
  await service.resetPassword(token, password)
  res.status(201).json({
    status: `success`,
    message: `Password reset successful`
  })
}

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  await service.changePassword(req.account.id, {oldPassword, newPassword})
  res.status(201).json({
    message: `Password changed successfully`
  })
}

exports.requestOTP = async (req, res) => {
  const { email, phone } = req.body
  const identifier = email || phone
  const data = await service.requestOTP({ identifier })
  res.status(201).json({ 
    message: `OTP sent`,
    data
  })
}

exports.verifyOTP = async (req, res) => {
  const deviceId = req.headers[`x-device-id`]
  const { email, phone, otp } = req.body
  const identifier = email || phone
  const data = await service.verifyOTP({ identifier, otp}, deviceId)
  res.status(201).json({
    message: `Login successful`,
    data
  })
}

exports.getAllAccounts = async ( req, res ) => {
  const data = await service.getAllAccounts(req)
  res.status(200).json({
    status: `success`,
    data
  })
}
 
exports.getAccount = async ( req, res ) => {
  const email = req.query.email
  const phone = req.query.phone

  if (!email && !phone) {
    return res.status(200).json({
      status: `success`,
      data: req.account
    })
  }

  const account = await service.getAccountByIdentifier({ email, phone })
  res.status(200).json({
    status: `success`,
    account
  })
}

exports.updateAccount = async ( req, res ) => {
  const updatedData = req.body
  const data = await service.updateAccount(req.account.id, updatedData)
  res.status(201).json({
    message: `Account updated successfully`,
    data
  })
}

exports.softDeleteAccount = async (req, res) => {
  const { email } = req.body
  const data = await service.softDeleteAccount({ email })
  res.status(201).json({
    message: `Account deleted successfully`,
    data
  })
}

exports.restoreAccount = async (req, res) => {
  const { token, email, phone } = req.body
  const identifier = email || phone
  await service.restoreAccount({ token, identifier })
  res.status(201).json({
    message: `Account restored. Please log in`
  })
}
