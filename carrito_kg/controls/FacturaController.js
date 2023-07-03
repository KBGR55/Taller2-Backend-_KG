'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models');
var factura = models.factura;
var detalle = models.detalle;
var cuenta = models.cuenta;
var auto = models.auto;
var persona = models.persona;
var marca = models.marca;

const bcypt = require('bcrypt');

const salRounds = 8;

class FacturaController {
    async listar(req, res) {
        var listar = await factura.findAll({
            attributes: ['fecha_emision', 'numero_factura', 'sub_total',
                'iva', 'total_pagar', 'external_id', 'estado'],
            include: { model: persona, as: 'persona', attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await factura.findOne({
            where: { external_id: external }, include: { model: cuenta, as: 'cuenta', attributes: ['usuario'] },
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion']
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        var detalleAux = await detalle.findOne({ where: { external_id: req.body.external } });
        // console.log("-----",detalleAux.id_auto);
        let autoAux = await auto.findOne({ where: { id: detalleAux.id_auto } });
        //console.log("-----",autoAux);
        var valores = await factura.findOne({ where: { id: detalleAux.id_factura } });
        // console.log("-----",valores);
        if (valores === null) {
            res.status(400);
            res.json({ msg: 'No existe el detalle', code: 400 });
        } else {
            // console.log("entro",valores.sub_total);
            valores.sub_total = Number(autoAux.costo) + Number(valores.sub_total);
            //console.log("2",valores.sub_total);
            valores.iva = ((autoAux.costo * 0.12) + Number(valores.iva)),
            //console.log("3",valores.iva);
            valores.total_pagar = Number(valores.iva) + Number(valores.sub_total);
            // console.log("--------",valores.total_pagar);
            let personaAux = await persona.findOne({ where: { id: valores.id_persona} });
            autoAux.duenio= personaAux.identificacion;
            await autoAux.save();
            var result = await valores.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: 'No se ha guardado el detalle en factura', code: 400 });
            } else {
                res.status(200);
                res.json({ msg: 'Se guardado el detalle en factura', code: 200 });
            }
        }
    }

    async crearFactura(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var persona_id = req.body.external_persona;
            if (persona_id != undefined) {
                let personaAux = await persona.findOne({ where: { external_id: persona_id } });
                console.log(personaAux);
                if (personaAux) {
                    //data arreglo asociativo= es un direccionario = clave:valor
                    var data = {
                        direccion: req.body.direccion,
                        id_persona: personaAux.id,
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await factura.create(data);
                        await transaction.commit();
                        res.json({ msg: "Se han creado la factura", code: 200 });
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
                    res.json({ msg: "La persona no se encuentra", code: 400 });
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
module.exports = FacturaController;