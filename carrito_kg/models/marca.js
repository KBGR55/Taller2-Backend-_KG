'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const marca = sequelize.define('marca', {
        nombre: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        modelo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        pais: {type: DataTypes.STRING(50),defaultValue: "NO_DATA"},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        freezeTableName: true
    });
    marca.associate = function (models){
        marca.hasMany(models.auto, {foreignKey:'id_marca',as: 'auto'});
    };
    return marca;
};