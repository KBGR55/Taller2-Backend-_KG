'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var ordenCompra = models.ordenCompra;
var persona = models.persona;
var repuesto = models.repuesto;
var detalleOrdenCompra = models.detalleOrdenCompra;
var ordenIngreso=models.ordenIngreso;

class DetalleOrdenCompraController {

    async listar(req, res) {
        var listar = await detalleOrdenCompra.findAll({
            attributes: ['external_id', 'cantidad'],
            include: {
                model: repuesto,
                as: 'repuesto',
                attributes: ['nombre', 'tipo_categoria', 'estado', 'external_id', 'marca', 'costo']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await detalleOrdenCompra.findOne({
            where: { external_id: external },
            attributes: ['external_id'],
            include: {
                model: repuesto,
                as: 'repuesto',
                attributes: ['nombre', 'tipo_categoria', 'estado', 'external_id', 'marca', 'costo']
            }
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var ordenIngreso_id = req.body.external_ordenCompra;
            var repuesto_id = req.body.external_repuesto;
            if (ordenIngreso_id != undefined && repuesto_id != undefined) {
                let ordenIngresoAux = await ordenIngreso.findOne({ where: { external_id:ordenIngreso_id } });
                console.log("orden Ingreso"+repuesto_id, ordenIngresoAux );
                let repuestoAux = await repuesto.findOne({ where: { external_id: repuesto_id } });
                console.log("repuesto"+repuesto_id, repuestoAux);
                let ordenAux = await ordenCompra.findOne({ where: { id_ordenIngreso:  ordenIngresoAux.id} });
                console.log("Compra + "+ordenIngreso_id , ordenAux);
                if (repuestoAux && ordenAux) {
                    if (repuestoAux.estado === true) {
                        console.log("Entreeeeeeeeeeee");
                        var data = {
                            cantidad: req.body.cantidad,
                            id_repuesto: repuestoAux.id,
                            id_ordenCompra: ordenAux.id
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await detalleOrdenCompra.create(data);
                            await transaction.commit();
                            res.json({
                                msg: "Se facturo correctamente",
                                code: 200, dato: detalleOrdenCompra.external_id
                            }); 
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
                        res.json({ msg: "No se facturo", code: 200 });
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

    async modificar(req, res) {
        var detalle = await detalleOrdenCompra.findOne({ where: { external_id: req.body.external } });
        if (detalle === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            detalle.cantidad = req.body.cantidad;
            detalle.external_id = uuid.v4();
            var result = await detalle.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO SUS DATOS CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = DetalleOrdenCompraController;