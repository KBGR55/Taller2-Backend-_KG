'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
const { Op } = require('sequelize');
var auto = models.auto;
var marca = models.marca;
const bcypt = require('bcrypt');
const salRounds = 8;

class AutoController {
    async listar(req, res) {
        var listar = await auto.findAll({
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado', 'duenio'],
            include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listarDisponibles(req, res) {
        var listar = await auto.findAll({
            where: { estado: 'DISPONIBLE' },
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'duenio'],
            include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async listarVendidos(req, res) {
        var listar = await auto.findAll({
            where: { duenio: { [Op.not]: 'NO_DATA' } },
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado', 'duenio'],
            include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async listarReparacion(req, res) {
        var listar = await auto.findAll({
            where: { estado: 'REPARACION' },
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado', 'duenio'],
            include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async listarIngresarReparacion(req, res) {
        var listar = await auto.findAll({
            where: {
                duenio: { [Op.not]: 'NO_DATA' },
                estado: { [Op.not]: 'REPARACION' }
            },
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado', 'duenio'],
            include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] }
        });
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async obtener(req, res) {
        const external = req.params.external;
        var listar = await auto.findOne({
            where: { external_id: external }, include: { model: marca, as: 'marca', attributes: ['nombre', 'modelo', 'pais'] },
            attributes: ['anio', 'placa', 'color', 'costo', 'external_id', 'estado']
        });
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
    async numAuto(req, res) {
        const contar = await auto.count();
        res.json({ msg: 'OK!', code: 200, info: contar });
    }
    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var marca_id = req.body.external_marca;
            if (marca_id != undefined) {
                let marcaAux = await marca.findOne({ where: { external_id: marca_id } });
                console.log(marcaAux);
                if (marcaAux) {
                    //data arreglo asociativo= es un direccionario = clave:valor
                    var data = {
                        anio: req.body.anio,
                        placa: req.body.placa,
                        color: req.body.color,
                        costo: req.body.costo,
                        id_marca: marcaAux.id
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await auto.create(data, { transaction });
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
        console.log("ENTRO EN EL METODO")
        var carrito = await auto.findOne({ where: { external_id: req.body.external_id } });
        if (carrito === null) {
            console.log("valio");
            res.status(400);
            res.json({
                msg: "No existe registro",
                code: 400
            });
        } else {
            if (carrito.estado === true) {
                var uuid = require('uuid');
                carrito.anio = req.body.anio,
                    carrito.costo = req.body.costo;
                carrito.placa = req.body.placa;
                carrito.color = req.body.color;
                carrito.external_id = uuid.v4();
                var result = await carrito.save();
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
                    msg: "El auto no se puede modificar ya que esta vendido!!!",
                    code: 201
                });
            }

        }
    }
}

module.exports = AutoController;