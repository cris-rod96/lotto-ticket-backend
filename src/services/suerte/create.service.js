import { Cifras, DetallesSuerte, PuntosVenta, Suertes } from '../../lib/db.lib.js'

const crearSuerte = async (data) => {
  const { descripcion, premio, CifraId } = data

  // 1. Validaciones iniciales
  if (!CifraId) return { code: 400, message: 'Es necesaria la cifra para crear la suerte' }

  const cifra = await Cifras.findByPk(CifraId)
  if (!cifra) return { code: 400, message: 'No existe la cifra proporcionada' }

  if (parseFloat(premio) <= 0.0) {
    return { code: 400, message: 'El premio inicial debe ser mayor a 0' }
  }

  const descMayus = descripcion.toUpperCase()

  try {
    // 2. Verificar duplicados en el catálogo maestro
    const suerteExistente = await Suertes.findOne({
      where: {
        descripcion: descMayus,
        CifraId,
      },
    })

    if (suerteExistente) {
      return { code: 400, message: 'Ya existe esta suerte definida para esta cifra' }
    }

    // 3. Crear la Suerte Maestra
    const nuevaSuerte = await Suertes.create({
      descripcion: descMayus,
      CifraId,
      activo: true,
    })

    // 4. PROPAGACIÓN: Crear el detalle de premio para todos los puntos de venta
    // Buscamos todos los locales registrados actualmente
    const puntosVenta = await PuntosVenta.findAll()

    if (puntosVenta.length > 0) {
      const detallesACrear = puntosVenta.map((punto) => ({
        premio: premio,
        SuerteId: nuevaSuerte.id,
        PuntoVentaId: punto.id,
      }))

      // Inserción masiva para optimizar rendimiento
      await DetallesSuerte.bulkCreate(detallesACrear)
    }

    return {
      code: 201,
      message: `Suerte '${descMayus}' creada y vinculada a ${puntosVenta.length} puntos de venta.`,
    }
  } catch (error) {
    console.error('Error al crear suerte y detalles:', error)
    return { code: 500, message: 'Error interno al procesar la nueva suerte' }
  }
}

export { crearSuerte }
