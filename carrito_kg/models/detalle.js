'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const detalle= sequelize.define('detalle', {
        //cantidad: { type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        // estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });

    detalle.associate = function (models){
        detalle.belongsTo(models.auto,{foreignKey: 'id_auto'});
        detalle.belongsTo(models.factura,{foreignKey: 'id_factura'});
    }

    return detalle;
};