'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const factura= sequelize.define('factura', {
        fecha_emision: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        direccion:{ type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        numero_factura: { type: DataTypes.STRING(15),defaultValue:numeroFcaturar,unique: true},  
        metodo_pago: { type: DataTypes.ENUM('EFECTIVO', 'DEPOSITO', 'TRANSFERENCIA'), allowNull: false, defaultValue: 'EFECTIVO' },        
        sub_total:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        iva:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        total_pagar:{ type: DataTypes.DECIMAL(50, 2), defaultValue: 0.00 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        estado: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { freezeTableName: true});

    factura.associate = function (models){
        factura.belongsTo(models.persona, {foreignKey: 'id_persona'});
        factura.hasMany(models.detalle, {foreignKey: 'id_factura',as:'detalle'});
    }

    return factura;
};

function numeroFcaturar() {
    const establishmentNumber = '123'; // Número de establecimiento según el RUC
    const invoiceCounter = '001'; // Número de facturero
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(9, '0'); // Número de factura aleatorio de 9 dígitos
    return `${establishmentNumber}${invoiceCounter}${randomNumber}`;
}
  