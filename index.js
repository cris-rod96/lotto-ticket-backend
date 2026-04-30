import { envsConfig } from './src/config/index.config.js'
import { sq } from './src/lib/db.lib.js'
import server from './src/server.js'
server.listen(envsConfig.PORT, () => {
  console.log(`Servidor recibiendo peticiones por el puerto: ${envsConfig.PORT}`)

  sq.sync({
    logging: false,
    force: false,
    alter: false,
  })
    .then(() => {
      console.log('Base de datos sincronizada con éxito')
    })
    .catch((err) => {
      console.log(`Error al sincronizar la base de datos: ${err.message}`)
    })
})
