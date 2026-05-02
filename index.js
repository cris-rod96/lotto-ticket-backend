import cron from 'node-cron'
import { envsConfig } from './src/config/index.config.js'
import { sq } from './src/lib/db.lib.js'
import { cargarDatos } from './src/scripts/seed.script.js'
import server from './src/server.js'
import { sorteoServices } from './src/services/index.services.js'
server.listen(envsConfig.PORT, () => {
  console.log(`Servidor recibiendo peticiones por el puerto: ${envsConfig.PORT}`)

  sq.sync({
    logging: false,
    force: false,
    alter: true,
  })
    .then(() => {
      console.log('Base de datos sincronizada con éxito')

      cargarDatos()

      cron.schedule('* * * * *', async () => {
        try {
          const cerrados = await sorteoServices.verificarCierreSorteos()
          if (cerrados > 0) {
            console.log(
              `[SISTEMA]: Se han cerrado ${cerrados} sorteos automáticamente por tiempo límite.`
            )
          }
        } catch (error) {
          console.error('[CRON ERROR]: Error al procesar el cierre de sorteos:', error.message)
        }
      })
    })
    .catch((err) => {
      console.log(`Error al sincronizar la base de datos: ${err.message}`)
    })
})
