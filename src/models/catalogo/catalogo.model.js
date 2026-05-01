import { DataTypes } from 'sequelize'

const CatalogoModel = (sq) => {
  sq.define(
    'Catalogos',
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

      pais: {
        type: DataTypes.ENUM,
        values: ['EC', 'AR'],
        allowNull: false,
      },

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: 'Catalogos',
    }
  )
}

export default CatalogoModel
