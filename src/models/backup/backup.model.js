import { DataTypes } from 'sequelize'

const BackupModel = (sq) => {
  sq.define(
    'Backups',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entorno: {
        type: DataTypes.ENUM,
        values: ['development', 'production'],
        allowNull: false,
      },
    },
    { tableName: 'Backups', timestamps: true }
  )
}

export default BackupModel
