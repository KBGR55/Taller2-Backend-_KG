'use strict';
const { body, validationResult, check } = require('express-validator');
var models= require('../models/');
var marca=models.marca;
class MarcaController{

    async listar(req,res){
        var listar= await marca.findAll({
            attributes:['nombre','modelo','pais','external_id','estado']
        });
        res.json({msg:'OK!',code:200,info:listar});
    }
    async numMarca(req, res) {
        const contar = await marca.count();
        res.json({ msg: 'OK!', code: 200, info: contar });
    }
    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            //data arreglo asociativo= es un direccionario = clave:valor
            var data = {
                nombre: req.body.nombre,
                pais: req.body.pais,
                modelo: req.body.modelo
            }
            try {
                await marca.create(data);
                res.json({ msg: "Se han registrado los datos", code: 200 });
            } catch (error) {
                if (error.errors && error.errors[0].message) {
                    res.json({ msg: error.errors[0].message, code: 200 });
                } else {
                    res.json({ msg: error.message, code: 200 });
                }
            }           
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }
    }

    async modificar(req, res) {
        var marca = await marca.findOne({ where: { external_id: req.body.external_id } });
        if (marca === null) {
            res.status(400);
            res.json({ msg: 'No existe registro', code: 400 });
        } else {
            var uuid = require('uuid');
            marca.nombre= req.body.nombre;
            marca.pais= req.body.pais;
            marca.modelo= req.body.modelo;
            person.external_id = uuid.v4();
            var result = await person.save();
            if (result === null) {
                res.status(400);
                res.json({ msg: 'No se ha modificado sus datos', code: 400 });
            } else {
                res.status(200);
                res.json({ msg: 'Se ha modificado sus datos', code: 200 });
            }
        }
    }
}
module.exports = MarcaController;