const { z } = require(`zod`)
const nameRegex = 
/^[A-Z]/
const phoneRegex = 
/^0\d{10}$/

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name too short").regex(nameRegex, "First name must start with a capital letter"),
    lastName: z.string().trim().min(2, "Last name too short").regex(nameRegex, "Last name must start with a capital letter"),

    username: z.string().min(6, "Username must be at least 6 letters"),
    age: z.number().int().positive().min(18, "Age must be at least 18"),
   
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    phone: z.string().regex(phoneRegex).optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string()
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or Phone number is required"
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match", 
    path: ["confirmPassword"]
  })
  
const loginSchema = z
  .object({
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    phone: z.string().regex(phoneRegex).optional(),
    password: z.string()
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or Phone number is required"
  })

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
    }) 


const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8,"Password must be at least 8 characters"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),

    confirmNewPassword: z
      .string()
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"]
  })

const updateAccountSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name too short").regex(nameRegex, "First name must start with a capital letter").optional(),
    lastName: z.string().trim().min(2, "Last name too short").regex(nameRegex, "Last name must start with a capital letter").optional(),

    username: z.string().min(6, "Username must be at least 6 letters").optional(),
    age: z.number().int().positive().min(18, "Age must be at least 18").optional(),
   
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    phone: z.string().regex(phoneRegex).optional(),
  }).strict()

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateAccountSchema,
  changePasswordSchema
}