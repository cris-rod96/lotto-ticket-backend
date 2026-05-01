import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { json } from 'express'
import rootRouter from './routes/index.routes.js'

const server = express()

server.use(json({ limit: '5mb' }))
server.use(cors())
server.use(cookieParser())

server.use('/api/golpe-de-la-suerte', rootRouter)

export default server
