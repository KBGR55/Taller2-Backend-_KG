'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const { Op } = require('sequelize');
var repuesto = models.repuesto;
var marca = models.marca;
const bcypt = require('bcrypt');
const salRounds = 8;

class RepuestoController {
    async listar(req, res) {
        var listar = await repuesto.findAll({
            attributes: ['nombre', 'tipo_categoria', 'marca', 'estado', 'costo', 'external_id','id']
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external_id = req.params.external_id;
        var listar = await repuesto.findOne({
            where: { external_id: external_id }, attributes: ['nombre', 'tipo_categoria', 'marca', 'estado', 'costo', 'external_id','id']
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async numrepuesto(req, res) {
        const contar = await repuesto.count();
        res.json({ msg: 'OK!', code: 200, info: contar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            //data arreglo asociativo= es un direccionario = clave:valor
            var data = {
                'nombre': req.body.nombre,
                'tipo_categoria': req.body.tipo_categoria,
                'marca': req.body.marca,
                'costo': req.body.costo
            }
            let transaction = await models.sequelize.transaction();
            try {
                await repuesto.create(data, { transaction });
                await transaction.commit();
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
            res.status(400);
            res.json({ msg: "Datos no encontrados", code: 400 });
        }

    }

    async modificar(req, res) {
        var repuestoEdit = await repuesto.findOne({ where: { external_id: req.body.external_id } });
        if (repuestoEdit === null) {
            res.status(400);
            res.json({ msg: "No existe registro", code: 400 });
        } else {
            if (repuestoEdit.estado === true) {
                var uuid = require('uuid');
                repuestoEdit.nombre = req.body.nombre;
                repuestoEdit.tipo_categoria = req.body.tipo_categoria;
                repuestoEdit.marca = req.body.marca;
                repuestoEdit.costo = req.body.costo;
                repuestoEdit.external_id = uuid.v4();
                var result = await repuestoEdit.save();
                if (result === null) {
                    res.status(400);
                    res.json({
                        msg: "No se ha modificado sus datos",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: "Se ha modificado sus datos",
                        code: 200
                    });
                }
            } else {
                res.status(201);
                res.json({
                    msg: "El repuesto no se puede modificar ya que esta vendido!!!",
                    code: 201
                });
            }

        }
    }
}

module.exports = RepuestoController;