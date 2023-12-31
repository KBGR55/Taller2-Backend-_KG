'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        usuario: { type: DataTypes.STRING(50), allowNull: false },
        clave: { type: DataTypes.STRING(70), allowNull: false },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });

    cuenta.associate = function (models){
        cuenta.belongsTo(models.persona, {foreignKey: 'id_persona'});
    }

    return cuenta;
};