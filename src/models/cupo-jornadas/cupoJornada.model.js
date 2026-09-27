import { DataTypes } from "sequelize";

const CupoJornadas = (sq) => {
  sq.define("CupoJornadas", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    }, 

    jornada: {
      type: DataTypes.ENUM("Mañanera", "Matutina", "Vespertina", "Nocturna"),
      allowNull: false,
    },
    cupoMaximo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    CatlogoId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Catalogos",
        key: "id"
      }
    },
    CifraId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Cifras',
        key: "id"
      }
    }

  }, {
    tableName: "CupoJornadas",
    timestamps: true
  })
}


export default CupoJornadas