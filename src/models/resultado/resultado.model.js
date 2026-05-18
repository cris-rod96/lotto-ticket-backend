import { DataTypes } from 'sequelize'

const ResultadoModel = (sq) => {
  sq.define(
    'Resultados',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      SorteoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Sorteos',
          key: 'id',
        },
      },
      fechaRegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'Resultados',
    }
  )
}

export default ResultadoModel
