import { DataTypes } from 'sequelize'

const SuerteModel = (sq) => {
  sq.define(
    'Suertes',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      premio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      CifraId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Cifras',
          key: 'id',
        },
      },
    },
    {
      tableName: 'Suertes',
      timestamps: true,
    }
  )
}

export default SuerteModel
