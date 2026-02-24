const express = require('express')
const router = express.Router()

const filterAccounts = require(`../middleware/filterAccounts`)

const {
  getAllAccounts,
  getAccount,
  register,
  updateAccount,
  login,
  getMyAccount,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  requestOTP,
  verifyOTP,
  softDeleteAccount,
  restoreAccount,
  changePassword
} = require('../controllers/account.controller')

const { protect, authRoles } = require('../middleware/auth')

const validate = require(`../middleware/validate`)
const { registerSchema, loginSchema, resetPasswordSchema, changePasswordSchema, updateAccountSchema, } = require(`../schemas/auth.schema`)

router.get(`/get`, protect, authRoles(`admin`), getAccount)
router.get(`/`, filterAccounts, protect, authRoles(`admin`), getAllAccounts)
router.get('/me', protect, getMyAccount)
router.post(`/register`, validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/forgot-password', forgotPassword)
router.post(`/reset-password/:token`, validate(resetPasswordSchema), resetPassword)
router.post(`/request`, requestOTP)
router.post(`/verify`, verifyOTP)
router.post('/logout', protect, logout) 
router.post('/refresh', refresh)
router.post(`/changePassword`, protect, validate(changePasswordSchema), changePassword)
router.patch(`/restore`, restoreAccount)
router.patch(`/me`, protect, validate(updateAccountSchema), updateAccount)
router.delete(`/`, protect, softDeleteAccount)


module.exports = router