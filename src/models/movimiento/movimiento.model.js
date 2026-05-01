import { DataTypes } from 'sequelize'

const MovimientoModel = (sq) => {
  sq.define(
    'Movimientos',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      tipo: {
        type: DataTypes.ENUM,
        values: ['Ingreso', 'Egreso'],
        allowNull: false,
      },

      categoria: {
        type: DataTypes.ENUM(
          'Venta Ticket',
          'Pago Premio',
          'Anulacion',
          'Gasto Operativo',
          'Ajuste de Caja'
        ),
        allowNull: false,
      },

      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },

      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Para guardar el código del ticket o motivo del gasto',
      },

      CajaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Cajas',
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
    },
    {
      timestamps: true,
      tableName: 'Movimientos',
    }
  )
}

export default MovimientoModel
