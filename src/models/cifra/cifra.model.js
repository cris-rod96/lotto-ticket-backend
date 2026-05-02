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

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      cupoMaximoPorNumero: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      valorMinimoTicket: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'Cifras',
      timestamps: true,
    }
  )
}

export default CifraModel
