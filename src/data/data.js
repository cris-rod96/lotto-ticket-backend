// Definiciones de Roles del Sistema
export const ROLES = [{ nombre: 'ADMINISTRADOR' }, { nombre: 'VENDEDOR' }]

// Configuración de Cifras (Parámetros generales de juego)
export const CIFRAS = [
  {
    cantidad: 2,
    cupoMaximoPorNumero: 15.0,
    valorMinimoTicket: 0.25,
  },
  {
    cantidad: 3,
    cupoMaximoPorNumero: 2.0,
    valorMinimoTicket: 0.25,
  },
]

// Usuarios de Prueba (Asegúrate de asociar el Vendedor a un Punto de Venta en tu DB)
export const USUARIO_TEST = [
  {
    nombresCompletos: 'Administrador General',
    alias: 'admin',
    rolNombre: 'ADMINISTRADOR',
  },
  {
    nombresCompletos: 'Vendedor Normal',
    alias: 'vendedor',
    rolNombre: 'VENDEDOR',
  },
]

/* 
  CATÁLOGOS MAESTROS DE SUERTES
  Ahora solo contienen la descripción. El premio se manejará en DetallesSuerte.
*/
export const SUERTES_2_CIFRAS = [
  { descripcion: 'PRIMERA SUERTE' },
  { descripcion: 'SEGUNDA SUERTE' },
  { descripcion: 'TERCERA SUERTE' },
  { descripcion: 'CUARTA SUERTE' },
  { descripcion: 'QUINTA SUERTE' },
  { descripcion: 'SEXTA SUERTE' },
  { descripcion: 'SEPTIMA SUERTE' },
  { descripcion: 'OCTAVA SUERTE' },
]

export const SUERTES_3_CIFRAS = [
  { descripcion: 'PRIMERA SUERTE' },
  { descripcion: 'SEGUNDA SUERTE' },
  { descripcion: 'TERCERA SUERTE' },
  { descripcion: 'CUARTA SUERTE' },
  { descripcion: 'QUINTA SUERTE' },
  { descripcion: 'SEXTA SUERTE' },
  { descripcion: 'SEPTIMA SUERTE' },
  { descripcion: 'OCTAVA SUERTE' },
]

/* 
  VALORES POR DEFECTO PARA DETALLES SUERTE
  Estos valores se usarán para llenar la tabla 'DetallesSuerte' 
  cada vez que se cree un nuevo Punto de Venta.
*/
export const PREMIOS_DEFAULT_2_CIFRAS = {
  'PRIMERA SUERTE': 72.0,
  'SEGUNDA SUERTE': 10.0,
  'TERCERA SUERTE': 5.0,
  'CUARTA SUERTE': 3.0,
  'QUINTA SUERTE': 2.0,
  'SEXTA SUERTE': 2.0,
  'SEPTIMA SUERTE': 1.0,
  'OCTAVA SUERTE': 1.0,
}

export const PREMIOS_DEFAULT_3_CIFRAS = {
  'PRIMERA SUERTE': 610.0,
  'SEGUNDA SUERTE': 50.0,
  'TERCERA SUERTE': 40.0,
  'CUARTA SUERTE': 20.0,
  'QUINTA SUERTE': 15.0,
  'SEXTA SUERTE': 10.0,
  'SEPTIMA SUERTE': 10.0,
  'OCTAVA SUERTE': 5.0,
}
