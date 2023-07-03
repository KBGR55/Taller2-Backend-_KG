'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models');
var ordenCompra = models.ordenCompra;
var detalleOrdenCompra = models.detalleOrdenCompra;
var cuenta = models.cuenta;
var auto = models.auto;
var ordenIngreso = models.ordenIngreso;

const bcypt = require('bcrypt');

const salRounds = 8;

class OrdenCompraController {
    async listar(req, res) {
        var listar = await ordenCompra.findAll({
            attributes: ['num_orden_compra', 'fecha_emision', 'lugar_emision', 'metodo_pago', 'sub_total', 'iva', 'total_pagar', 'external_id', 'estado'],
           /**  include: {
                model: ordenIngreso, as: 'ordenIngreso', attributes: ['numero_orden_ingreso', 'fecha_ingreso', 'fecha_entrega', 'estado', 'external_id', 'tipo_identificacion']
            }*/
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external_id = req.params.external_id;
        var listar = await ordenCompra.findOne({
            where: { external_id: external_id },  attributes: ['num_orden_compra', 'fecha_emision', 'lugar_emision', 'metodo_pago', 'sub_total', 'iva', 'total_pagar', 'external_id', 'estado'],
            include: {
                model: ordenIngreso, as: 'ordenIngreso', attributes: ['numero_orden_ingreso', 'fecha_ingreso', 'fecha_entrega', 'estado', 'external_id', 'tipo_identificacion'],
                include: {
                    model: auto, as: 'auto', attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado', 'duenio'],
                    include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
                }
            }
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        var detalleOrdenCompraAux = await detalleOrdenCompra.findOne({ where: { external_id: req.body.external } });
        // console.log("-----",detalleOrdenCompraAux.id_repuesto);
        let repuestoAux = await auto.findOne({ where: { id: detalleOrdenCompraAux.id_repuesto } });
        //console.log("-----",repuestoAux);
        var valores = await ordenCompra.findOne({ where: { id: detalleOrdenCompraAux.id_ordenCompra } });
        // console.log("-----",valores);
        if (valores === null) {
            res.status(400);
            res.json({ msg: 'No existe el detalleOrdenCompra', code: 400 });
        } else {
            // console.log("entro",valores.sub_total);
            valores.sub_total = Number(repuestoAux.costo) + Number(valores.sub_total);
            //console.log("2",valores.sub_total);
            valores.iva = ((repuestoAux.costo * 0.12) + Number(valores.iva)),
            //console.log("3",valores.iva);
            valores.total_pagar = Number(valores.iva) + Number(valores.sub_total);
            // console.log("--------",valores.total_pagar);
            let ordenIngresoAux = await ordenIngreso.findOne({ where: { id: valores.id_ordenIngreso } });
           // repuestoAux.duenio = ordenIngresoAux.identificacion;
            //await repuestoAux.save();
            var result = await valores.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: 'No se ha guardado el detalleOrdenCompra en ordenCompra', code: 400 });
            } else {
                res.status(200);
                res.json({ msg: 'Se guardado el detalleOrdenCompra en ordenCompra', code: 200 });
            }
        }
    }

    async crearOrdenCompra(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var ordenIngreso_id = req.body.external_ordenIngreso;
            if (ordenIngreso_id != undefined) {
                let ordenIngresoAux = await ordenIngreso.findOne({ where: { external_id: ordenIngreso_id } });
                console.log(ordenIngresoAux);
                if (ordenIngresoAux) {
                    var data = {
                        lugar_emision: req.body.lugar_emision,
                        id_ordenIngreso: ordenIngresoAux.id,
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await ordenCompra.create(data);
                        await transaction.commit();
                        res.json({ msg: "Se han creado la ordenCompra", code: 200 });
                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.errors && error.errors[0].message) {
                            res.json({ msg: error.errors[0].message, code: 200 });
                        } else {
                            res.json({ msg: error.message, code: 200 });
                        }
                    }
                } else {
                    res.status(400);
                    res.json({ msg: "La ordenIngreso no se encuentra", code: 400 });
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

    async obtener(req, res) {
        const external = req.params.external;
        let listar = await ordenReparacion.findOne({
            where: { external_id: external },
            attributes: ['numeroReparacion', 'external_id', 'fechaEmision', 'lugarEmision', 'estado', 'metodoPago', 'subTotal', 'valorIVA', 'total'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'direccion', 'identificacion']
                },
            ]
        });   
        if (listar === null) {
            listar = {};
        }
    
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }   

    async generar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var ordenIngreso_id = req.body.external_ordenIngreso;
            if (ordenIngreso_id != undefined) {
                let ingresoAux = await ordenIngreso.findOne({ where: { external_id: ordenIngreso_id } });
                if (ingresoAux) {
                    var data = {
                        lugarEmision: req.body.lugarEmision,
                        metodoPago: req.body.metodoPago,
                        id_ordenIngreso: ingresoAux.id
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await ordenReparacion.create(data)
                        await transaction.commit();
                        res.json({
                            msg: "SE HAN REGISTRADO LOS DATOS DE LA ORDEN DE REPARACION",
                            code: 200
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

    async calcularValoresOrden(req, res) {
        var id= await ordenIngreso.findOne({where: { external_id:req.body.external_id}});
        var totales = await ordenCompra.findOne({ where: { id_ordenIngreso:id.id}});
        if (totales === null) { 
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            totales.sub_total = req.body.subTotal;
            totales.iva = req.body.valorIVA;
            totales.total_pagar= req.body.total;   
            var result = await totales.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "EL CALCULO NO SE HA REALIZADO EXITOSAMENTE",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "EL CALCULO SE HA REALIZADO EXITOSAMENTE",
                    code: 200
                });
            }
        }
    }

}
module.exports = OrdenCompraController;