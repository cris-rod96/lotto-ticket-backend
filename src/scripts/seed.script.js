import envsConfig from '../config/envs.config.js'
import { CIFRAS, ROLES, SUERTES_2_CIFRAS, SUERTES_3_CIFRAS, USUARIO_TEST } from '../data/data.js'
import { Cifras, PuntosVenta, Roles, Suertes, Usuarios } from '../lib/db.lib.js'
import { bcrypUtils } from '../utils/index.utils.js'

export const cargarDatos = async () => {
  try {
    // 1. Cargar Roles y crear el mapa de IDs
    const rolesMap = {}
    for (const rol of ROLES) {
      const [registro, creado] = await Roles.findOrCreate({
        where: { nombre: rol.nombre },
        defaults: rol,
      })
      if (creado) console.log(`Rol creado: ${rol.nombre}`)
      rolesMap[rol.nombre] = registro.id
    }

    // 2. CREAR PUNTO DE VENTA INICIAL (Ajustado a tu modelo: nombre, ubicacion, activo)
    const [puntoPrincipal, puntoCreado] = await PuntosVenta.findOrCreate({
      where: { nombre: 'MATRIZ PRINCIPAL' },
      defaults: {
        nombre: 'MATRIZ PRINCIPAL',
        ubicacion: 'GUAYAQUIL, ECUADOR',
        activo: true, // Usando el campo 'activo' de tu modelo
      },
    })
    if (puntoCreado) console.log('Punto de Venta Matriz creado exitosamente.')

    const claveHasheada = await bcrypUtils.hashearClave(envsConfig.PASSWORD_ADMIN_DEFAULT)

    // 3. MAPEAR USUARIOS CON LÓGICA DE PUNTO DE VENTA
    for (const user of USUARIO_TEST) {
      // Verificamos si es administrador (ignorando mayúsculas/minúsculas)
      const esAdmin = user.rolNombre.match(/admin/i)

      await Usuarios.findOrCreate({
        where: {
          alias: user.alias,
        },
        defaults: {
          nombresCompletos: user.nombresCompletos,
          alias: user.alias,
          clave: claveHasheada,
          RolId: rolesMap[user.rolNombre],
          // Si es admin va nulo, si no, se asigna a la Matriz Principal
          PuntoVentaId: esAdmin ? null : puntoPrincipal.id,
        },
      })
    }

    // 4. Cargar Cifras
    const cifrasMap = {}
    for (const cifra of CIFRAS) {
      const [registro, creado] = await Cifras.findOrCreate({
        where: { cantidad: cifra.cantidad },
        defaults: cifra,
      })
      cifrasMap[cifra.cantidad] = registro.id
      if (creado) console.log(`Cifra ${cifra.cantidad} cargada.`)
    }

    // 5. Cargar Suertes vinculadas
    const suertes2CifrasData = SUERTES_2_CIFRAS.map((suerte) => ({
      ...suerte,
      CifraId: cifrasMap[2],
    }))

    const suertes3CifrasData = SUERTES_3_CIFRAS.map((suerte) => ({
      ...suerte,
      CifraId: cifrasMap[3],
    }))

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

    console.log('--- PROCESO DE CARGA INICIAL COMPLETADO ---')
  } catch (error) {
    console.error('Error crítico en el seed de datos:', error)
  }
}
