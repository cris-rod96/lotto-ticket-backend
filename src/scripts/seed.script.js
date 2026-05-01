import envsConfig from '../config/envs.config.js'
import { CIFRAS, ROLES, SUERTES_2_CIFRAS, SUERTES_3_CIFRAS, USUARIO_TEST } from '../data/data.js'
import { Cifras, Roles, Suertes, Usuarios } from '../lib/db.lib.js'
import { bcrypUtils } from '../utils/index.utils.js'

export const cargarDatos = async () => {
  try {
    console.log('Iniciando carga de datos por defecto...')
    const rolesMap = {}
    for (const rol of ROLES) {
      const [registro, creado] = await Roles.findOrCreate({
        where: { nombre: rol.nombre },
        defaults: rol,
      })
      if (creado) console.log(`Rol creado: ${rol.nombre}`)
      rolesMap[rol.nombre] = registro.id
    }

    const claveHasheada = await bcrypUtils.hashearClave(envsConfig.PASSWORD_ADMIN_DEFAULT)

    await Usuarios.findOrCreate({
      where: {
        alias: USUARIO_TEST.alias,
      },
      defaults: {
        nombresCompletos: USUARIO_TEST.nombresCompletos,
        alias: USUARIO_TEST.alias,
        clave: claveHasheada,
        RolId: rolesMap[USUARIO_TEST.rolNombre],
      },
    })

    const cifrasMap = {}

    for (const cifra of CIFRAS) {
      const [registro, creado] = await Cifras.findOrCreate({
        where: { cantidad: cifra.cantidad },
        defaults: cifra,
      })

      // Guardamos el ID en memoria para usarlo en el siguiente paso
      cifrasMap[cifra.cantidad] = registro.id

      if (creado) console.log(`Cifra ${cifra.cantidad} creada.`)
    }

    // 2. Preparar Suertes de 2 Cifras
    const suertes2CifrasData = SUERTES_2_CIFRAS.map((suerte) => ({
      ...suerte,
      CifraId: cifrasMap[2], // Vinculamos con el ID de la cifra 2
    }))

    // 3. Preparar Suertes de 3 Cifras
    const suertes3CifrasData = SUERTES_3_CIFRAS.map((suerte) => ({
      ...suerte,
      CifraId: cifrasMap[3], // Vinculamos con el ID de la cifra 3
    }))

    // 4. Cargar Suertes (evitando repetidos por descripción y CifraId)
    const todasLasSuertes = [...suertes2CifrasData, ...suertes3CifrasData]

    for (const suerte of todasLasSuertes) {
      await Suertes.findOrCreate({
        where: {
          descripcion: suerte.descripcion,
          CifraId: suerte.CifraId,
        },
        defaults: suerte,
      })
    }

    console.log('¡Datos cargados exitosamente!')
  } catch (error) {
    console.error('Error cargando datos por defecto:', error)
  }
}
