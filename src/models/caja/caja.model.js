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

      fechaApertura: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      fechaCierre: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      montoApertura: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      saldoActual: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      totalInyecciones: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
        type: DataTypes.ENUM,
        values: ['Abierta', 'Cerrada'],
        defaultValue: 'Abierta',
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
