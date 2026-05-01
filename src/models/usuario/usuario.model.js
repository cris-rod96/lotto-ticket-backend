import { DataTypes } from 'sequelize'

const UsuarioModel = (sq) => {
  sq.define(
    'Usuarios',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      nombresCompletos: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      alias: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      clave: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      RolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id',
        },
      },

      PuntoVentaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'PuntosVenta',
          key: 'id',
        },
      },
    },
    {
      tableName: 'Usuarios',
      timestamps: true,
    }
  )
}

export default UsuarioModel
