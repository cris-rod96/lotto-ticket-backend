import { DataTypes } from 'sequelize'

const TicketModel = (sq) => {
  sq.define(
    'Tickets',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      estado: {
        type: DataTypes.ENUM,
        values: ['Pendiente', 'Pagado', 'Anulado', 'Expirado'],
        defaultValue: 'Pendiente',
      },

      resultado: {
        type: DataTypes.ENUM,
        values: ['Pendiente', 'Ganador', 'No Ganador'],
        defaultValue: 'Pendiente',
      },

      fechaCaducidad: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      montoTotalPremio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      SorteoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Sorteos',
          key: 'id',
        },
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

      ClienteId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Clientes',
          key: 'id',
        },
      },
    },
    { tableName: 'Tickets', timestamps: true }
  )
}

export default TicketModel
