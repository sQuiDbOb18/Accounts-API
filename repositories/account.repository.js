const Account = require(`../models/account.model`)

exports.create = (data) => Account.create(data)

exports.findByIdentifier = (identifier) => 
  Account.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    isDeleted: false
  }).select("+password")

exports.findByRefreshToken = (hashedToken) => 
  Account.findOne({
    "refreshTokens.refreshToken": hashedToken,
    isDeleted: false
  })

exports.findById = (id) => Account.findById(id) 

exports.findByResetToken = (hashedToken) => {
  return Account.findOne({
    resetPasswordToken: hashedToken, 
    resetPasswordExpire: { $gt: Date.now() },
    idDeleted: false
  }).select("+password")
}

exports.getAccounts = (query, options) => {
  let q = Account.find(query)
  
  if (options.select) {
    q = q.select(options.select)
  } else {
    q = q.select(`-refreshTokens`)
  }
  
  return q.sort(options.sort)
    .skip(options.skip)
    .limit(options.limit)
    .where(`isDeleted`).equals(false)
}

exports.findByEmailOrPhone = ({email, phone}) => {
  const query = { isDeleted: false }
  
  if (email) {
    query.email = email
  } else if (phone) {
    query.phone = phone
  }
  
  return Account.findOne(query)
} 

exports.updateById = (id, data) => {
  return Account.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
      isDeleted: false
    }
  )
}

exports.findByOTP = (hashed, identifier) => {
  return Account.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    loginOTP: hashed,
    loginOTPExpire: { $gt: Date.now() },
    isDeleted: false
  })
}

exports.softDeleteAccount = ( email ) => {
  return Account.findOneAndUpdate({
    email,
    isDeleted: false
  })
}

exports.findByRestoreToken = ( hashed, identifier ) => {
  return Account.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    restoreToken: hashed,
    restoreTokenExpire: { $gt: Date.now() },
    isDeleted: true
  })
}