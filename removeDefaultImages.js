'use strict';

var fs = require('fs');
var imageDefault = './default.jpg';
var imageSize = fs.statSync(imageDefault).size;
var imagenesFiltradas = [];
var sizeOf = require('image-size');

var mongoose = require('mongoose');
var Q = require('q');
mongoose.connect('mongodb://127.0.0.1:27017/casadellibro');

var libroSchema = new mongoose.Schema({
	_id: String,
	isbn: String,
	titulo: String,
	precio: Number,
	autor: String,
	libreria: String,
	editorial: String,
	idioma: String,
	descripcion: String,
	encuadernacion: String,
	paginas: Number,
	url: String,
	picUrl: String,
	fecha: Date,
	identificador: String,
	formato: String,
	status: String
});

var libro = mongoose.model('libro', libroSchema);


var imagenes = fs.readdirSync('./images');
imagenes.forEach(function(item) {
	var hasWrongSize = false;
	var imageAux = fs.statSync('images/' + item).size;
	var file = 'images/' + item;
	try {
		var dimensions = sizeOf(file);
		if(dimensions.width >= 250 || dimensions.height >= 250) {
			hasWrongSize = false;
		} else {
			hasWrongSize = true;
		}
	} catch(e) {
		if(e.message === 'unsupported file type') {
			hasWrongSize = true;
		}
	} finally {
		if(imageAux === imageSize || hasWrongSize) {
			item = item.slice(0, item.indexOf('.'));
			imagenesFiltradas.push(item)
		}		
	}
})

for(var x = 0; x < imagenesFiltradas.length; x++) {
	libro.findOne({ isbn: imagenesFiltradas[x] }, function (err, doc){
	  if(!err) {
	  	doc.picUrl = '';
	  	doc.save();
	  }
	});
}