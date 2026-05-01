import { envsConfig } from './src/config/index.config.js'
import { sq } from './src/lib/db.lib.js'
import { cargarDatos } from './src/scripts/seed.script.js'
import server from './src/server.js'
server.listen(envsConfig.PORT, () => {
  console.log(`Servidor recibiendo peticiones por el puerto: ${envsConfig.PORT}`)

  sq.sync({
    logging: false,
    force: true,
    alter: true,
  })
    .then(() => {
      console.log('Base de datos sincronizada con éxito')

      cargarDatos()
    })
    .catch((err) => {
      console.log(`Error al sincronizar la base de datos: ${err.message}`)
    })
})
