import { Cifras } from '../../lib/db.lib.js'

const agregarCifra = async (data) => {
  const { cantidad, cupoMaximoPorNumero } = data
  const cifra = await Cifras.findOne({
    where: {
      cantidad,
    },
  })

  if (cifra) return { code: 400, message: 'Ya existe esta cifra' }

  if (parseFloat(cupoMaximoPorNumero) <= 0.0)
    return { code: 400, message: 'El cupo máximo debe ser mayor a 0' }

  await Cifras.create(data)
  return { code: 201, message: 'Cifra agregada con éxito' }
}

export { agregarCifra }
