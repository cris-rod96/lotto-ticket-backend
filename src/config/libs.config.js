import envsConfig from './envs.config.js'

const DATABASE_URI =
  envsConfig.NODE_ENV === 'development' ? envsConfig.DATABASE_URI_DEV : envsConfig.DATABASE_URI_PROD

const DATABASE_CONFIG = {
  URI: DATABASE_URI,
  OPTIONS:
    envsConfig.NODE_ENV === 'development'
      ? {
          logging: false,
          dialatec: 'postgres',
          native: false,
        }
      : {
          logging: false,
          dialatec: 'postgres',
          native: false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        },
}

export default {
  DATABASE_CONFIG,
}
