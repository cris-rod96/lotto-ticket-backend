import { DataTypes } from 'sequelize'

const DetalleTicketModel = (sq) => {
  sq.define(
    'DetallesTicket',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      numeroJugado: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      montoApostado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      montoPremio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      TicketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'DetallesTicket',
    }
  )
}

export default DetalleTicketModel
