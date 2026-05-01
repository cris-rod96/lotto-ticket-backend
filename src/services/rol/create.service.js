import { Roles } from '../../lib/db.lib.js'

const crearRol = async (data) => {
  const rolExiste = await Roles.findAll({
    where: {
      nombre: data.nombre,
    },
  })

  if (rolExiste) return { code: 400, message: 'El rol ya se encuentra registrado' }

  await Roles.create(data)
  return { code: 201, message: 'Rol creado con éxito' }
}

export { crearRol }
