import { DataTypes } from 'sequelize'

const PuntoVentaModel = (sq) => {
  sq.define(
    'PuntosVenta',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ubicacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: 'PuntosVenta',
    }
  )
}

export default PuntoVentaModel
