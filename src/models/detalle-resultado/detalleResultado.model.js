import { DataTypes } from 'sequelize'

const DetalleResultadoModel = (sq) => {
  sq.define(
    'DetallesResultado',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      SuerteId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Suertes',
          key: 'id',
        },
      },

      numeroSorteado: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      numeroGanador: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      cantidadGanadores: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ResultadoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Resultados',
          key: 'id',
        },
      },
      TicketId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Tickets',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'DetallesResultado',
    }
  )
}

export default DetalleResultadoModel
