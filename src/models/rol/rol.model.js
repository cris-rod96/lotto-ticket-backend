import { DataTypes } from 'sequelize'

const RolModel = (sq) => {
  sq.define(
    'Roles',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      tableName: 'Roles',
    }
  )
}

export default RolModel
