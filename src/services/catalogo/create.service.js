import { Catalogos } from '../../lib/db.lib.js'

const agregarACatalogo = async (data) => {
  const { nombre, pais } = data

  const existe = await Catalogos.findOne({
    where: {
      nombre,
      pais,
    },
  })

  if (existe)
    return { code: 400, message: 'Ya existe un sorteo con el mismo nombre dentro del país' }

  await Catalogos.create(data)
  return { code: 201, message: 'Agregado al catálogo con éxito' }
}

export { agregarACatalogo }
