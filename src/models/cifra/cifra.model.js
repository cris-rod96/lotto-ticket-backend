import { DataTypes } from 'sequelize'

const CifraModel = (sq) => {
  sq.define(
    'Cifras',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 2,
        },
      },
    },
    {
      tableName: 'Cifras',
      timestamps: true,
    }
  )
}

export default CifraModel
