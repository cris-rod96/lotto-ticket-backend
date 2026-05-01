import { Cifras, Suertes } from '../../lib/db.lib.js'

const crearSuerte = async (data) => {
  const { descripcion, premio, CifraId } = data

  if (!CifraId) return { code: 400, message: 'Es necesaria la cifra para crear la suerte' }

  const cifra = await Cifras.findByPk(CifraId)
  if (!cifra) return { code: 400, message: 'No existe la cifra proporcionada' }

  const descMayus = descripcion.toUpperCase()
  const suerte = await Suertes.findOne({
    where: {
      descripcion: descMayus,
      CifraId,
    },
  })

  if (suerte) return { code: 400, message: 'Ya existe una suerte para esta cifra' }

  if (parseFloat(premio) <= 0.0) return { code: 400, message: 'El premio debe ser mayor a 0' }

  await Suertes.create(data)
  return { code: 201, message: 'Suerte agregada con éxito' }
}

export { crearSuerte }
