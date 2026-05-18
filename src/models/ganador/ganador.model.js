import { DataTypes } from 'sequelize'

const GanadorModel = (sq) => {
  sq.define(
    'Ganadores',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      TicketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Tickets', key: 'id' },
      },
      DetalleResultadoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'DetallesResultado', key: 'id' },
      },
      montoPremio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estadoPago: {
        type: DataTypes.ENUM('Pendiente', 'Pagado', 'Expirado'),
        defaultValue: 'Pendiente',
      },
      fechaCaducidad: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fechaPago: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'Ganadores',
    }
  )
}

export default GanadorModel
