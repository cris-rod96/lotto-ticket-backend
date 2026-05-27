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
    // 2. Buscar primero el Punto de Venta Matriz para copiar sus premios por defecto
    const puntoMatriz = await PuntosVenta.findOne({
      where: { nombre: 'MATRIZ PRINCIPAL' },
    })

    if (!puntoMatriz) {
      return {
        code: 404,
        message: 'No se encontró la MATRIZ PRINCIPAL para heredar los premios base.',
      }
    }

    // 3. Traer los detalles de premios configurados en la Matriz
    const detallesMatriz = await DetallesSuerte.findAll({
      where: { PuntoVentaId: puntoMatriz.id },
    })

    // 4. Crear el Nuevo Punto de Venta
    const nuevoPunto = await PuntosVenta.create(data)

    // 5. VINCULACIÓN AUTOMÁTICA DE SUERTES CON PREMIOS HEREDADOS
    if (detallesMatriz.length > 0) {
      // Mapeamos basándonos en los premios reales de la Matriz
      const detallesHeredados = detallesMatriz.map((detalle) => ({
        premio: detalle.premio,
        SuerteId: detalle.SuerteId,
        PuntoVentaId: nuevoPunto.id,
      }))

      // Inserción masiva de la configuración clonada (Corregido el typo aquí)
      await DetallesSuerte.bulkCreate(detallesHeredados)
    } else {
      // Caso de respaldo: Si la matriz no tenía filas, mapeamos en cero
      const todasLasSuertes = await Suertes.findAll()
      if (todasLasSuertes.length > 0) {
        const detallesEnCero = todasLasSuertes.map((suerte) => ({
          premio: 0.0,
          SuerteId: suerte.id,
          PuntoVentaId: nuevoPunto.id,
        }))
        await DetallesSuerte.bulkCreate(detallesEnCero)
      }
    }

    return {
      code: 201,
      message: `Punto de venta '${nombre}' creado con éxito. Se configuraron ${detallesMatriz.length || todasLasSuertes.length} suertes heredando los valores de la Matriz.`,
    }
  } catch (error) {
    console.error('Error al registrar punto de venta:', error)
    return { code: 500, message: 'Error interno al crear el punto de venta y sus suertes' }
  }
}

export { registrarPuntoVenta }
