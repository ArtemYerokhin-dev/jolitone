import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

console.log('Testing SMTP connection...')
console.log('Host:', process.env.SMTP_HOST)
console.log('User:', process.env.SMTP_USER)

try {
  await transporter.verify()
  console.log('✅ SMTP connection OK')

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: 'Тест Joli Tone',
    text: 'Email відправка працює!',
  })
  console.log('✅ Test email sent!')
} catch (err) {
  console.error('❌ Error:', err.message)
}
