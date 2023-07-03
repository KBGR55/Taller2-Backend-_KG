'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models');
const { ENUM } = require('sequelize');
var detalle = models.detalle;
var rol = models.rol;
var cuenta = models.cuenta;
var auto = models.auto;
var factura = models.factura;
var persona = models.persona;

class DetalleController {
    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var auto_id = req.body.external_auto;
            var factura_id = req.body.external_factura;
            if ((auto_id != undefined) && (factura_id != undefined)) {
                let autoAux = await auto.findOne({ where: { external_id: auto_id } });
                let facturaAux = await factura.findOne({ where: { external_id: factura_id } });
                console.log(autoAux);
                if (autoAux && facturaAux) {
                    console.log(autoAux.estado);
                    if (autoAux.estado === 'DISPONIBLE') {
                        //data arreglo asociativo= es un direccionario = clave:valor
                        var data = {
                            id_factura: facturaAux.id,
                            id_auto: autoAux.id
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await detalle.create(data, { transaction });
                            await transaction.commit();
                            autoAux.estado = 'VENDIDO';
                            var resultA = await autoAux.save();
                            if (resultA === null) {
                                res.status(400);
                                res.json({ msg: 'No se ha modificado sus datos', code: 400 });
                            } else {
                                res.status(200);
                                res.json({ msg: 'Auto vendido', code: 200 });
                            }
                            res.json({ msg: "Se han registrado los datos", code: 200 });
                        } catch (error) {
                            if (transaction) await transaction.rollback();
                            if (error.errors && error.errors[0].message) {
                                res.json({ msg: error.errors[0].message, code: 200 });
                            } else {
                                res.json({ msg: error.message, code: 200 });
                            }
                        }
                    } else {
                        res.status(200);
                        res.json({ msg: "Auto no disponible", code: 200, errors: errors });
                    }
                } else {
                    res.status(400);
                    res.json({ msg: "Datos no encontrados", code: 400 });
                }
            } else {
                res.status(400);
                res.json({ msg: "Faltan datos", code: 400 });
            }
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }
    }
}
module.exports = DetalleController;