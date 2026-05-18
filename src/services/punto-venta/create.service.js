import { DetallesSuerte, PuntosVenta, Suertes } from '../../lib/db.lib.js'

const registrarPuntoVenta = async (data) => {
  const { nombre } = data

  // 1. Evitar duplicados por nombre
  const puntoExistente = await PuntosVenta.findOne({
    where: { nombre },
  })

  if (puntoExistente) {
    return { code: 400, message: 'Ya existe un punto de venta registrado con este nombre' }
  }

  try {
    // 2. Crear el Punto de Venta
    const nuevoPunto = await PuntosVenta.create(data)

    // 3. VINCULACIÓN AUTOMÁTICA DE SUERTES
    // Buscamos todas las suertes maestras definidas (2 y 3 cifras)
    const todasLasSuertes = await Suertes.findAll()

    if (todasLasSuertes.length > 0) {
      // Preparamos los detalles con premio inicial 0.00
      const detallesIniciales = todasLasSuertes.map((suerte) => ({
        premio: 0.0,
        SuerteId: suerte.id,
        PuntoVentaId: nuevoPunto.id,
      }))

      // Inserción masiva de la configuración inicial
      await DetallesSuerte.bulkCreate(detallesIniciales)
    }

    return {
      code: 201,
      message: `Punto de venta '${nombre}' creado y configurado con ${todasLasSuertes.length} suertes iniciales.`,
    }
  } catch (error) {
    console.error('Error al registrar punto de venta:', error)
    return { code: 500, message: 'Error interno al crear el punto de venta y sus suertes' }
  }
}

export { registrarPuntoVenta }
