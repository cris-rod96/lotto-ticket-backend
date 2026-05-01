import { Sequelize } from 'sequelize'
import { libsConfig } from '../config/index.config.js'
import { models } from '../models/index.models.js'

const sq = new Sequelize(libsConfig.DATABASE_CONFIG.URI, libsConfig.DATABASE_CONFIG.OPTIONS)

models.forEach((m) => m(sq))

export { sq }
