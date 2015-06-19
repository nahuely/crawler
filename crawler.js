#!/usr/bin/env node
/*
Version: 1
Fecha: 
Autor: 

Flujo del programa:
el crawler recorre el paginado, o la categoria que se le pase por linea de comandos, y ira bajando los libros uno a uno, y chequeara si ese libro esta presente en al base de datos, fijandose en el isbn o el titulo, si no esta en la base lo agregara y formara parte del csv que se genere, si el libro esta en la base de datos, no se ingresara a la misma ni tampoco formara parte del csv que se genere. Para mantener sincronizada la base de datos se usara el listingdump que dispone fileExchange.
la base de datos tendra la siguiente estructura, titulo, isbn, precio, url de la imagen(thumbnail , y picurl), precio, peso, cantidad de paginas, fecha de creacion del item, libreria, categoria, store category

uso: crawler -u url -p factor precio -o nombre de archivo -s todo o solo en stock -d debug activo -f subir a ftp automaticamenteo no -c categoria -sc categoria en el store*/

var argumentos = require('optimist').argv;
var config = require('./config');
var Sitio = require('./store');
delete argumentos._;
delete argumentos.$0;

if(argumentos.debug == 'true') console.log(argumentos);

var sitio = new Sitio(argumentos);
sitio.getDominio();
sitio.getNombre();
sitio.getLinks()
	.then(function() {
		sitio.getLibros();
	})
	.catch(function(err) {
		console.log(err)
	})


//(function() {
//	console.log(sitio)
//	sitio.getLibros();
//})