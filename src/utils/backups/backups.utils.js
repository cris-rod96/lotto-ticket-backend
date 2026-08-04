// src/services/backup.service.js
// import { exec } from 'child_process'
// import fs from 'fs'
// import path from 'path'
// import { cloudinary, envsConfig } from '../../config/index.config.js'
// // IMPORTACIÓN DIRECTA: Importamos el modelo Backups tal cual lo solicitaste
// import { Backups } from '../../lib/db.lib.js' // Ajusta la ruta exacta a tu archivo de modelos/BD

// export const ejecutarCopiaSeguridad = async () => {
//   console.log('[SISTEMA - BACKUP]: Iniciando generación de volcado de base de datos...')

//   // 1. OBTENER FECHA Y HORA DINÁMICAS (Formato Ecuador)
//   const ahora = new Date()
//   const opciones = {
//     timeZone: 'America/Guayaquil',
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: false,
//   }

//   const formateador = new Intl.DateTimeFormat('es-EC', opciones)
//   const [
//     { value: dia },
//     ,
//     { value: mes },
//     ,
//     { value: año },
//     ,
//     { value: hora },
//     ,
//     { value: minuto },
//   ] = formateador.formatToParts(ahora)

//   // Nombre dinámico tal cual lo necesitas
//   const nombreArchivo = `backup_el_golpe_de_la_suerte_${dia}_${mes}_${año}_${hora}_${minuto}.sql`
//   const rutaLocal = path.join(process.cwd(), nombreArchivo)

//   // 2. CONFIGURACIÓN DINÁMICA SEGÚN EL ENTORNO
//   let DB_URI = ''
//   let comandoPgDump = ''
//   let carpetaEntorno = ''

//   if (envsConfig.NODE_ENV === 'development') {
//     // EN DESARROLLO: Base de datos local + Ruta absoluta de pg_dump v18
//     DB_URI = envsConfig.DATABASE_URI_DEV
//     comandoPgDump = `/usr/lib/postgresql/18/bin/pg_dump`
//     carpetaEntorno = 'desarrollo'
//   } else {
//     // EN PRODUCCIÓN: Base de datos de Render + Comando global
//     DB_URI = envsConfig.DATABASE_URI_PROD
//     comandoPgDump = 'pg_dump'
//     carpetaEntorno = 'produccion'
//   }

//   // 3. CONSTRUIR EL COMANDO EXACTO
//   const comandoFinal = `${comandoPgDump} "${DB_URI}" > "${rutaLocal}"`
//   const folderCloudinary = `golpe-de-la-suerte/${carpetaEntorno}`

//   // 4. EJECUTAR EL COMANDO EN LA TERMINAL
//   exec(comandoFinal, async (error, stdout, stderr) => {
//     if (error || !fs.existsSync(rutaLocal)) {
//       console.error(
//         '[BACKUP ERROR - PG_DUMP]:',
//         error?.message || 'No se pudo crear el archivo local'
//       )
//       return
//     }

//     try {
//       console.log(`[SISTEMA - BACKUP]: Archivo local creado con éxito: ${nombreArchivo}`)
//       console.log(`[SISTEMA - BACKUP]: Subiendo a Cloudinary en la carpeta: ${folderCloudinary}...`)

//       // 5. SUBIR A CLOUDINARY ASIGNANDO EL NOMBRE DINÁMICO
//       const resultado = await cloudinary.uploader.upload(rutaLocal, {
//         folder: folderCloudinary,
//         public_id: nombreArchivo.replace('.sql', ''),
//         resource_type: 'raw',
//       })

//       console.log(`[SISTEMA - BACKUP]: ¡Copia de seguridad disponible en Cloudinary!`)
//       console.log(`[SISTEMA - BACKUP]: URL: ${resultado.secure_url}`)

//       // 6. GUARDAR REGISTRO EN LA BASE DE DATOS
//       // Usamos el modelo 'Backups' directamente para registrar los datos
//       await Backups.create({
//         nombre: nombreArchivo,
//         url: resultado.secure_url,
//         entorno: envsConfig.NODE_ENV,
//       })
//       console.log('[SISTEMA - BACKUP]: Historial guardado en la base de datos correctamente.')

//       // 7. LIMPIEZA: Eliminar el archivo temporal local
//       fs.unlinkSync(rutaLocal)
//       console.log('[SISTEMA - BACKUP]: Archivo temporal local eliminado.')
//     } catch (uploadError) {
//       console.error('[BACKUP ERROR - CLOUDINARY/DATABASE]:', uploadError.message)
//       // En caso de error, limpiamos el archivo local si alcanzó a generarse
//       if (fs.existsSync(rutaLocal)) fs.unlinkSync(rutaLocal)
//     }
//   })
// }

// src/services/backup.service.js
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib' // <-- IMPORTAMOS ZLIB PARA COMPRIMIR
import { pipeline } from 'stream/promises' // <-- PARA MANEJAR STREAMS DE FORMA SEGURA
import { cloudinary, envsConfig } from '../../config/index.config.js'
import { Backups } from '../../lib/db.lib.js'

export const ejecutarCopiaSeguridad = async () => {
  console.log('[SISTEMA - BACKUP]: Iniciando generación de volcado de base de datos...')

  // 1. OBTENER FECHA Y HORA DINÁMICAS (Formato Ecuador)
  const ahora = new Date()
  const opciones = {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const formateador = new Intl.DateTimeFormat('es-EC', opciones)
  const [
    { value: dia },
    ,
    { value: mes },
    ,
    { value: año },
    ,
    { value: hora },
    ,
    { value: minuto },
  ] = formateador.formatToParts(ahora)

  // Nombres dinámicos (añadimos .gz al final porque estará comprimido)
  const nombreArchivoSql = `backup_el_golpe_de_la_suerte_${dia}_${mes}_${año}_${hora}_${minuto}.sql`
  const nombreArchivoGz = `${nombreArchivoSql}.gz`
  
  const rutaLocalSql = path.join(process.cwd(), nombreArchivoSql)
  const rutaLocalGz = path.join(process.cwd(), nombreArchivoGz)

  // 2. CONFIGURACIÓN DINÁMICA SEGÚN EL ENTORNO
  let DB_URI = ''
  let comandoPgDump = ''
  let carpetaEntorno = ''

  if (envsConfig.NODE_ENV === 'development') {
    DB_URI = envsConfig.DATABASE_URI_DEV
    comandoPgDump = `/usr/lib/postgresql/18/bin/pg_dump`
    carpetaEntorno = 'desarrollo'
  } else {
    DB_URI = envsConfig.DATABASE_URI_PROD
    comandoPgDump = 'pg_dump'
    carpetaEntorno = 'produccion'
  }

  // 3. CONSTRUIR EL COMANDO EXACTO
  const comandoFinal = `${comandoPgDump} "${DB_URI}" > "${rutaLocalSql}"`
  const folderCloudinary = `golpe-de-la-suerte/${carpetaEntorno}`

  // 4. EJECUTAR EL COMANDO EN LA TERMINAL
  exec(comandoFinal, async (error, stdout, stderr) => {
    if (error || !fs.existsSync(rutaLocalSql)) {
      console.error(
        '[BACKUP ERROR - PG_DUMP]:',
        error?.message || 'No se pudo crear el archivo local'
      )
      return
    }

    try {
      console.log(`[SISTEMA - BACKUP]: Archivo SQL creado. Comprimiendo a .gz...`)

      // 5. COMPRIMIR EL ARCHIVO SQL A GZIP (.gz)
      const readStream = fs.createReadStream(rutaLocalSql)
      const writeStream = fs.createWriteStream(rutaLocalGz)
      const gzip = zlib.createGzip()

      await pipeline(readStream, gzip, writeStream)

      // Eliminar el archivo .sql pesado original de la computadora, solo nos quedamos con el .gz
      fs.unlinkSync(rutaLocalSql)

      console.log(`[SISTEMA - BACKUP]: Archivo comprimido con éxito: ${nombreArchivoGz}`)
      console.log(`[SISTEMA - BACKUP]: Subiendo a Cloudinary en la carpeta: ${folderCloudinary}...`)

      // 6. SUBIR A CLOUDINARY EL ARCHIVO COMPRIMIDO
      const resultado = await cloudinary.uploader.upload(rutaLocalGz, {
        folder: folderCloudinary,
        public_id: nombreArchivoGz.replace('.sql.gz', ''),
        resource_type: 'raw',
      })

      console.log(`[SISTEMA - BACKUP]: ¡Copia de seguridad disponible en Cloudinary!`)
      console.log(`[SISTEMA - BACKUP]: URL: ${resultado.secure_url}`)

      // 7. GUARDAR REGISTRO EN LA BASE DE DATOS
      await Backups.create({
        nombre: nombreArchivoGz,
        url: resultado.secure_url,
        entorno: envsConfig.NODE_ENV,
      })
      console.log('[SISTEMA - BACKUP]: Historial guardado en la base de datos correctamente.')

      // 8. LIMPIEZA: Eliminar el archivo .gz temporal local
      fs.unlinkSync(rutaLocalGz)
      console.log('[SISTEMA - BACKUP]: Archivo temporal local eliminado.')

    } catch (uploadError) {
      console.error('[BACKUP ERROR - CLOUDINARY/DATABASE]:', uploadError.message)
      
      // Limpieza de emergencia por si algo falla
      if (fs.existsSync(rutaLocalSql)) fs.unlinkSync(rutaLocalSql)
      if (fs.existsSync(rutaLocalGz)) fs.unlinkSync(rutaLocalGz)
    }
  })
}
