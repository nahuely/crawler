#!/usr/bin/env node
/*
Version: 1
Fecha: 
Autor: 

Flujo del programa:
uso: generadorCsv --output nombre de archivo --debug true|false --identificador string --filto json
*/
var async = require("async");
var argumentos = require("optimist").argv;
var Csv = require("./csv");

delete argumentos._;
delete argumentos.$0;
var identificador = argumentos.identificador || '';
var output = argumentos.output || '';
var debug = argumentos.debug || '';
var filtro =  argumentos.filtro || {};
var porcentaje =  parseInt(argumentos.porcentaje) || 65;
var ebayCategory = argumentos.ebayCategory;
var storeCategory = argumentos.storeCategory;
if(argumentos.debug == "true") console.log(argumentos);

if(!identificador) {
	console.log('uso: generadorCsv --output nombre de archivo --debug true|false --identificador string --filto json\nTiene que especificar un identificador --porcentaje --ebayCategory --storeCategory');
	process.exit();
}

var csv = new Csv(identificador, output, debug, filtro, porcentaje, ebayCategory, storeCategory);

csv.getLibros()
	.then(function(data) {
		var stringCsv = csv.generarCsv(data);
		return csv.crearArchivo(stringCsv);
	})
	.then(function() {
		process.exit();
	})
	.catch(function(err) {
		console.log(err);
	})