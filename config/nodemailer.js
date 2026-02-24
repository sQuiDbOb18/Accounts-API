// const nodemailer = require(`nodemailer`)
// const { default: hbs} = require(`nodemailer-express-handlebars`)
// const path = require(`path`)

// const transporter = nodemailer.createTransport({
//   host: process.env.BREVO_SMTP_HOST,
//   port: 2525,
//   secure: false,
//   auth: {
//     user: process.env.BREVO_SMTP_USER,
//     pass: process.env.BREVO_SMTP_PASS
//   }
// })

// transporter.use(
//   `compile`,
//   hbs({
//     viewEngine: {
//       extName: `.hbs`,
//       partialsDir: path.join(__dirname, '..', 'views'),
//       defaultLayout: false,
//     },
//     viewPath: path.join(__dirname, '..', 'views'),
//     extName: `.hbs`
//   })
// )

// module.exports = transporter