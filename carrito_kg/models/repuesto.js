'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const repuesto = sequelize.define('repuesto', {
        nombre: { type: DataTypes.STRING(30), defaultValue: "NO_DATA", allowNull: false },
        tipo_categoria: { type: DataTypes.ENUM('TRANSMISION', 'MOTOR', 'ELECTRICO', 'SUSPENSION', 'DIRECCION', 'EMBRAGUE', 'FRENOS', 'CARROCERIA', 'REFRIGERACION'), allowNull: false, defaultValue: 'MOTOR' },
        marca: { type: DataTypes.STRING(15), defaultValue: "NO_DATA", allowNull: false },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true }, costo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0, allowNull: false },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true});

    repuesto.associate = function (models) {
        repuesto.hasMany(models.detalleOrdenCompra, { foreignKey: 'id_repuesto', as: 'detalleOrdenCompra' });
    }

    return repuesto;
};