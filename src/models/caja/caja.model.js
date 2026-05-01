import { DataTypes } from 'sequelize'

const CajaModel = (sq) => {
  sq.define(
    'Cajas',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      montoApertura: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      montoActual: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },

      montoCierre: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      diferencia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      PuntoVentaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'PuntosVenta',
          key: 'id',
        },
      },

      UsuarioId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'Cajas',
    }
  )
}

export default CajaModel
