'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const auto= sequelize.define('auto', {
        anio: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        placa: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        color: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        costo: { type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        duenio: {type: DataTypes.STRING(15), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, {
        freezeTableName: true
    });

    auto.associate = function (models){
        auto.belongsTo(models.marca, {foreignKey:'id_marca'});
        auto.hasOne(models.detalle, {foreignKey:'id_auto',as:'detalle'});
    }

    return auto;
};