import { Sequelize } from 'sequelize'
import { libsConfig } from '../config/index.config.js'

const sq = new Sequelize(libsConfig.DATABASE_CONFIG.URI, libsConfig.DATABASE_CONFIG.OPTIONS)

export { sq }
