import envsConfig from '../config/envs.config.js'
import {
  CIFRAS,
  PREMIOS_DEFAULT_2_CIFRAS,
  PREMIOS_DEFAULT_3_CIFRAS,
  ROLES,
  SUERTES_2_CIFRAS,
  SUERTES_3_CIFRAS,
  USUARIO_TEST,
} from '../data/data.js'
import { Cifras, DetallesSuerte, PuntosVenta, Roles, Suertes, Usuarios } from '../lib/db.lib.js'
import { bcrypUtils } from '../utils/index.utils.js'

export const cargarDatos = async () => {
  try {
    // 1. Cargar Roles
    const rolesMap = {}
    for (const rol of ROLES) {
      const [registro] = await Roles.findOrCreate({
        where: { nombre: rol.nombre },
        defaults: rol,
      })
      rolesMap[rol.nombre] = registro.id
    }

    // 2. Crear Punto de Venta Matriz
    const [puntoPrincipal, puntoCreado] = await PuntosVenta.findOrCreate({
      where: { nombre: 'MATRIZ PRINCIPAL' },
      defaults: {
        nombre: 'MATRIZ PRINCIPAL',
        ubicacion: 'GUAYAQUIL, ECUADOR',
        activo: true,
      },
    })
    if (puntoCreado) console.log('Punto de Venta Matriz creado.')

    // 3. Cargar Usuarios (CORREGIDO: Sin warning de rolNombre)
    const claveHasheada = await bcrypUtils.hashearClave(envsConfig.PASSWORD_ADMIN_DEFAULT)
    for (const user of USUARIO_TEST) {
      // Separamos rolNombre para que no se envíe a la tabla Usuarios
      const { rolNombre, ...userData } = user
      const esAdmin = rolNombre.match(/admin/i)

      await Usuarios.findOrCreate({
        where: { alias: userData.alias },
        defaults: {
          ...userData,
          clave: claveHasheada,
          RolId: rolesMap[rolNombre],
          PuntoVentaId: esAdmin ? null : puntoPrincipal.id,
        },
      })
    }

    // 4. Cargar Cifras
    const cifrasMap = {}
    for (const cifra of CIFRAS) {
      const [registro] = await Cifras.findOrCreate({
        where: { cantidad: cifra.cantidad },
        defaults: cifra,
      })
      cifrasMap[cifra.cantidad] = registro.id
    }

    // 5. Cargar Suertes (Catálogo Maestro)
    const suertesCreadas = []
    const todasLasSuertesData = [
      ...SUERTES_2_CIFRAS.map((s) => ({ ...s, CifraId: cifrasMap[2], cantidad: 2 })),
      ...SUERTES_3_CIFRAS.map((s) => ({ ...s, CifraId: cifrasMap[3], cantidad: 3 })),
    ]

    for (const suerteData of todasLasSuertesData) {
      const [suerteRegistro] = await Suertes.findOrCreate({
        where: {
          descripcion: suerteData.descripcion,
          CifraId: suerteData.CifraId,
        },
        defaults: {
          descripcion: suerteData.descripcion,
          CifraId: suerteData.CifraId,
          activo: true,
        },
      })
      suertesCreadas.push({
        id: suerteRegistro.id,
        descripcion: suerteRegistro.descripcion,
        cantidad: suerteData.cantidad,
      })
    }

    // 6. Vincular Premios al Punto de Venta Matriz
    console.log('Asignando premios al punto de venta matriz...')
    for (const s of suertesCreadas) {
      const valorPremio =
        s.cantidad === 2
          ? PREMIOS_DEFAULT_2_CIFRAS[s.descripcion]
          : PREMIOS_DEFAULT_3_CIFRAS[s.descripcion]

      await DetallesSuerte.findOrCreate({
        where: {
          SuerteId: s.id,
          PuntoVentaId: puntoPrincipal.id,
        },
        defaults: {
          premio: valorPremio,
          SuerteId: s.id,
          PuntoVentaId: puntoPrincipal.id,
        },
      })
    }

    console.log('--- PROCESO DE CARGA Y DETALLES COMPLETADO ---')
  } catch (error) {
    console.error('Error crítico en el seed de datos:', error)
  }
}
