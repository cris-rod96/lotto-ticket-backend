import { DataTypes } from 'sequelize'

const DetallesSuerte = (sq) => {
  sq.define(
    'DetallesSuerte',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      premio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      PuntoVentaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'PuntosVenta',
          key: 'id',
        },
      },
      SuerteId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Suertes',
          key: 'id',
        },
      },
    },
    {
      tableName: 'DetallesSuerte',
      timestamps: true,
    }
  )
}

export default DetallesSuerte
