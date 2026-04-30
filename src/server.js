import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { json } from 'express'

const server = express()

server.use(json({ limit: '5mb' }))
server.use(cors())
server.use(cookieParser())

export default server
