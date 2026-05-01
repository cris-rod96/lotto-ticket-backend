import 'dotenv/config'

const {
  PORT = 3000,
  NODE_ENV = 'development',
  DATABASE_URI_DEV,
  DATABASE_URI_PROD,
  PASSWORD_ADMIN_DEFAULT,
} = process.env

export default { NODE_ENV, PORT, DATABASE_URI_DEV, DATABASE_URI_PROD, PASSWORD_ADMIN_DEFAULT }
