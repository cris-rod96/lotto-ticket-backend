import { Cifras } from '../../lib/db.lib.js'

const actualizarCupoMaximo = async (id, cupoMaximo) => {
  const cifra = await Cifras.findByPk(id)

  if (!cifra) return { code: 400, message: 'No se encontró la cifra a actualizar' }

  if (parseFloat(cupoMaximo) <= 0)
    return { code: 400, message: 'El cupo máximo deber ser mayor a 0' }

  if (cifra.cupoMaximoPorNumero == parseFloat(cupoMaximo))
    return { code: 400, message: 'No se registraron cambios. El cupo máximo no ha variado' }

  await cifra.update({ cupoMaximoPorNumero: cupoMaximo })
  return { code: 200, message: 'Cupo máximo actualizado' }
}

const recuperarCifra = async (id) => {
  const cifra = await Cifras.findByPk(id)
  if (!cifra) return { code: 400, message: "No se encontró la cifra a recuperar" }

  if (cifra.activo === true) return { code: 400, message: "La cifra ya se encuentra activa" }


  await cifra.update({
    activo: true
  })

  return { code: 200, message: "Cifra activada con éxito." }
}

export { actualizarCupoMaximo, recuperarCifra }
