import { DataTypes } from 'sequelize'

const ClienteModel = (sq) => {
  sq.define(
    'Clientes',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      nombres: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      cedula: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      whatsapp: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      PuntoVentaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'PuntosVenta',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'Clientes',
    }
  )
}

export default ClienteModel
