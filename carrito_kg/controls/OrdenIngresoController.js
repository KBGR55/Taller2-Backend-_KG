'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var auto = models.auto;
var ordenIngreso = models.ordenIngreso;
var marca = models.marca;
const { QueryTypes } = require('sequelize');

class OrdenIngresoController { 

    async listar(req, res) {
        const lista = await models.sequelize.query(
          "SELECT auto.placa, auto.anio, auto.external_id ,auto.estado, auto.color, auto.costo, auto.duenio,persona.nombres, persona.apellidos, persona.identificacion,persona.tipo_identificacion,ordenIngreso.numero_orden_ingreso, ordenIngreso.external_id, ordenIngreso.fecha_ingreso, ordenIngreso.fecha_entrega, ordenIngreso.descripcion, ordenIngreso.estado FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion INNER JOIN ordenIngreso ON auto.placa = ordenIngreso.placa WHERE auto.estado = 'REPARACION'",
          { type: models.Sequelize.QueryTypes.SELECT }
        );
      
        if (lista.length === 0) {
          res.status(200);
          res.json({ msg: "No existen datos registrados", code: 200, info: lista });
        } else {
          res.status(200);
          res.json({ msg: "OK!", code: 200, info: lista });
        }
    }

    async obtener(req, res) {
        const external_id = req.params.id;
        const listar = await models.sequelize.query(
            "SELECT auto.placa, auto.anio, auto.external_id ,auto.estado, auto.color, auto.costo, auto.duenio,persona.nombres, persona.apellidos, persona.identificacion,persona.direccion,persona.tipo_identificacion,ordenIngreso.numero_orden_ingreso, ordenIngreso.external_id, ordenIngreso.fecha_ingreso, ordenIngreso.fecha_entrega, ordenIngreso.descripcion, ordenIngreso.estado FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion INNER JOIN ordenIngreso ON auto.placa = ordenIngreso.placa WHERE ordenIngreso.external_id = "+"'"+external_id+"'",
            { type: models.Sequelize.QueryTypes.SELECT }
        );
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    
    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var auto_id = req.body.external_auto;
            if (auto_id != undefined ) {
                let autoAux = await auto.findOne({ where: { external_id: auto_id } });
                let personaAux = await persona.findOne({ where: { identificacion:  autoAux.duenio}});
                if (autoAux && personaAux) {
                    console.log("perdidooo "+autoAux.estado);
                    if (autoAux.estado === 'VENDIDO') {
                        var data = {
                            fecha_entrega : req.body.fecha_entrega ,
                            descripcion: req.body.descripcion,
                            placa: autoAux.placa,
                            id_persona: personaAux.id
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await ordenIngreso.create(data);
                            await transaction.commit();
                            autoAux.estado = 'REPARACION';
                            var resulto = await autoAux.save();
                            if (resulto === null) {
                                res.status(400);
                                res.json({
                                    msg: "ERROR EN CAMBIO DE ESTADO",
                                    code: 400
                                });
                            } else {
                                res.status(200);
                                res.json({
                                    msg: "AUTO INGRESADO EN REPARACION",
                                    code: 200
                                });
                            }
                            res.json({
                                msg: "SE HAN REGISTRADO LOS DATOS DEL INGRESO",
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
                        res.status(200);
                        res.json({ msg: "Auto que no puede ser reparado", code: 200 });
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
module.exports = OrdenIngresoController;