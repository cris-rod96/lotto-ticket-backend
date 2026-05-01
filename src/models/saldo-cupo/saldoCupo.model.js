import { DataTypes } from 'sequelize'

const SaldoCupoModel = (sq) => {
  sq.define(
    'SaldosCupo',
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

      cupoMaximo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      montoAcumulado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      montoDisponible: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      SorteoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Sorteos',
          key: 'id',
        },
      },
    },
    {
      timestamps: true,
      tableName: 'SaldosCupo',
    }
  )
}

export default SaldoCupoModel
