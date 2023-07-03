'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const detalleOrdenCompra= sequelize.define('detalleOrdenCompra', {
        cantidad: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
    }, {freezeTableName: true});

    detalleOrdenCompra.associate = function (models){
        detalleOrdenCompra.belongsTo(models.repuesto, {foreignKey: 'id_repuesto'});   
        detalleOrdenCompra.belongsTo(models.ordenCompra, {foreignKey: 'id_ordenCompra'}); 
    }
    return detalleOrdenCompra;
};