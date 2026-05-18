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
      ResultadoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Resultados',
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
      numeroGanador: {
        type: DataTypes.STRING,
        allowNull: false, // El número que salió premiado
      },
    },
    {
      timestamps: true,
      tableName: 'DetallesResultado',
    }
  )
}

export default DetalleResultadoModel
