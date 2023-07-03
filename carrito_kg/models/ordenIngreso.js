'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const ordenIngreso = sequelize.define('ordenIngreso', {
        numero_orden_ingreso: {type: DataTypes.STRING, allowNull: false, defaultValue: '0001',get() {const rawValue = this.getDataValue('numero_orden_ingreso');const incrementedNumber = Number(rawValue) + 1; const formattedValue = incrementedNumber.toString().padStart(4, '0');return formattedValue;},},      
        fecha_ingreso: { type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        fecha_entrega: { type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        placa: {type: DataTypes.STRING(10), allowNull: true, defaultValue: "NO_DATA"},
        descripcion: { type: DataTypes.STRING(300), defaultValue: "NO_DATA", allowNull: false },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    },{freezeTableName: true});

    ordenIngreso.associate = function (models) {
       // ordenIngreso.belongsTo(models.auto, { foreignKey: 'id_auto' });
        ordenIngreso.hasOne(models.ordenCompra, { foreignKey: 'id_ordenIngreso', as: 'ordenCompra' });
        ordenIngreso.belongsTo(models.persona, {foreignKey: 'id_persona'});
    }

    return ordenIngreso;
};