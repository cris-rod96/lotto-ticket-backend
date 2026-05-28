import { v2 as cloudinary } from 'cloudinary'
import envsConfig from './envs.config.js'
const DATABASE_URI =
  envsConfig.NODE_ENV === 'development' ? envsConfig.DATABASE_URI_DEV : envsConfig.DATABASE_URI_PROD

const DATABASE_CONFIG = {
  URI: DATABASE_URI,
  OPTIONS:
    envsConfig.NODE_ENV === 'development'
      ? {
          logging: false,
          dialect: 'postgres',
          native: false,
        }
      : {
          logging: false,
          dialect: 'postgres',
          native: false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        },
}

cloudinary.config({
  cloud_name: envsConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envsConfig.CLOUDINARY_API_KEY,
  api_secret: envsConfig.CLOUDINARY_API_SECRET,
})
export { cloudinary }
export default {
  DATABASE_CONFIG,
}
