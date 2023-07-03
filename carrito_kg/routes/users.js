var express = require('express');
var router = express.Router();
const {body}=require('express-validator');
const RolController=require('../controls/RolController');
var rolController=new RolController();
const PersonaController=require('../controls/PersonaController');
var personaController=new PersonaController();
const MarcaController=require('../controls/MarcaController');
var marcaController=new MarcaController();
const AutoController=require('../controls/AutoController');
var autoController=new AutoController();
const FacturaController=require('../controls/FacturaController');
var facturaController=new FacturaController();
const DetalleController=require('../controls/DetalleController');
var detalleController=new DetalleController();
const CuentaController=require('../controls/CuentaController');
var cuentaController=new CuentaController();
const RepuestoController=require('../controls/RepuestoController');
var repuestoController=new RepuestoController();
const OrdenIngresoController =require('../controls/OrdenIngresoController');
var ordenIngresoController=new OrdenIngresoController();
const OrdenCompraController=require('../controls/OrdenCompraController');
var ordenCompraController=new OrdenCompraController();
const DetalleOrdenCompraController=require('../controls/DetalleOrdenCompraController');
var detalleOrdenCompraController=new DetalleOrdenCompraController();
let jwt = require('jsonwebtoken');

//Middleware||Falta autorizacion para roles
var auth=function middleware(req,res,next){
  const token=req.headers['x-api-token'];
  console.log(req.headers);
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token,llave,async (err,decoded)=>{
      if (err) {
        res.status(401);
        res.json({ msg: "Token no valido o expirado!", code: 401 });
      }else{
        var models=require('../models');
        var cuenta=models.cuenta;
        req.decoded=decoded; 
        let aux= await cuenta.findOne({where:{external_id:req.decoded.external}});
        if (aux===null) {
          res.status(401);
          res.json({ msg: "Token no valido!", code: 401 });
        } else {
          next();
        }
      }
    })
  } else {
    res.status(401);
    res.json({ msg: "No existe token", code: 401 });
  }
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({"version":"0.01","num":"5"});
});
//ROL
router.post('/roles/',rolController.listar);
//CUENTA
router.post('/sesion',[
  body('usuario','Ingrese un correo valido!').trim(),
  body('clave','Ingrese la clave').trim()
],cuentaController.sesion);
//PERSONA
router.post('/persona/guardar',[
  body('apellidos','Ingrese su apellido').trim().exists().not().isEmpty().isLength({min:3,max:50}).withMessage("Ingrese un valor mayor a 3 y menor que 50"),
  body('nombres','Ingrese su nombre').trim().exists().not().isEmpty().isLength({min:3,max:50}).withMessage("Ingrese un valor mayor a 3 y menor que 50")
],personaController.guardar);
router.post('/personas/modificar',auth,personaController.modificar);
router.get('/personas',auth,personaController.listar);
router.get('/personas/obtener/:external',auth,personaController.obtener);
//MARCA
router.get('/marcas',auth,marcaController.listar);
router.post('/marca/guardar',auth,marcaController.guardar);
router.post('/marca/modificar',auth,marcaController.modificar);
router.get('/marcas/num',auth,marcaController.numMarca);
//AUTO
router.get('/autos',autoController.listar);
router.post('/auto/guardar',autoController.guardar);
router.post('/autos/modificar',auth,autoController.modificar);
router.get('/auto/obtener/:external',auth,autoController.obtener);
router.get('/autos/disponibles',auth,autoController.listarDisponibles);
router.get('/autos/vendidos',auth,autoController.listarVendidos);
router.get("/autos/ingresarReparacion",auth,autoController.listarIngresarReparacion);
router.get('/autos/num',auth,autoController.numAuto);
//ORDEN INGRESO
router.get('/ordenIngresos',ordenIngresoController.listar);
router.post('/ordenIngreso/guardar',auth,ordenIngresoController.guardar);
router.get('/ordenIngreso/obtener/:id',auth,ordenIngresoController.obtener);
router.post('/ordenCompra/calcularvalores',ordenCompraController.calcularValoresOrden);
//ORDEEN COMPRA
router.get('/ordenCompras',ordenCompraController.listar);
router.post('/ordenCompra/crear',auth,ordenCompraController.crearOrdenCompra);
//DETALLE ORDEN COMPRA 
router.post('/detalleOrdenIngreso/guardar',auth,detalleOrdenCompraController.guardar);
//FACTURA
router.get('/facturas',facturaController.listar);
router.post('/factura/crear',facturaController.crearFactura);
router.post('/factura/crear/guardar',facturaController.guardar);
//DETALLE
router.post('/factura/crear/guardar/datalle',detalleController.guardar);
//REPUESTO
router.get('/repuestos',repuestoController.listar);
router.post('/repuesto/guardar',repuestoController.guardar);
router.get('/repuesto/obtener/:external_id',repuestoController.obtener);
/*
router.get('/sumar/:a/:b', function(req, res, next) {
  var a= req.params.a*1;
  var b= Number(req.params.b);
  var c=a+b;
  res.status(200);
    res.json({"msg":"OK","resp":c});
  
 
});
router.post('/sumar', function(req, res, next) {
  var a= Number(req.body.a);
  var b= Number(req.body.b);
  if(isNaN(a)||isNaN(b)){
    res.status(400);
    res.json({"msg":"Error: Faltan datos..."});
  }
  var c=a+b;
  res.status(200);
    res.json({"msg":"OK","resp":c});
  
 
});
*/
module.exports = router;