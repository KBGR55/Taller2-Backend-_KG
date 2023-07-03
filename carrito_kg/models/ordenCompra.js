'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const ordenCompra = sequelize.define('ordenCompra', {
        num_orden_compra: {type: DataTypes.STRING, allowNull: false, defaultValue: '000-000-000000001', get() {const rawValue = this.getDataValue('num_orden_compra');const prefix = rawValue.slice(0, 4);const middle = rawValue.slice(4, 7); const lastNumber = Number(rawValue.slice(8)); const incrementedNumber = lastNumber + 1; const separatedValue = `${prefix}-${middle}-${incrementedNumber.toString().padStart(9, '0')}`; return separatedValue;},},
        fecha_emision: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
        lugar_emision: { type: DataTypes.STRING(50), defaultValue: "NO_DATA", allowNull: false },
        metodo_pago: { type: DataTypes.ENUM('EFECTIVO', 'DEPOSITO', 'TRANSFERENCIA'), allowNull: false, defaultValue: 'EFECTIVO' },        
        sub_total:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        iva:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        total_pagar:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    },{freezeTableName: true});

    ordenCompra.associate = function (models) {
        ordenCompra.belongsTo(models.ordenIngreso, { foreignKey: 'id_ordenIngreso' });
        ordenCompra.hasMany(models.detalleOrdenCompra, { foreignKey: 'id_ordenCompra', as: 'detalleOrdenCompra' });
    }

    return ordenCompra;
};
