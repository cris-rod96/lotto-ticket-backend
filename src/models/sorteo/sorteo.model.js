import { DataTypes } from 'sequelize'

const SorteoModel = (sq) => {
  sq.define(
    'Sorteos',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      numero: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      jornada: {
        type: DataTypes.ENUM,
        values: ['Matutina', 'Vespertina', 'Nocturna'],
        allowNull: false,
      },

      fechaSorteo: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      horaSorteo: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      fechaCierre: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      horaCierre: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      estado: {
        type: DataTypes.ENUM,
        values: ['Abierto', 'Cerrado', 'Finalizado'],
        defaultValue: 'Abierto',
      },

      montoRecaudado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      montoPorPagar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      utilidadNeta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      montoPagado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      CatalogoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Catalogos',
          key: 'id',
        },
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
      timestamps: true,
      tableName: 'Sorteos',
    }
  )
}

export default SorteoModel
