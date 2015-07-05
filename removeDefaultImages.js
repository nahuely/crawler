var fs = require('fs');
var async = require('async');
var imageDefault = './default.jpg';
var imageSize = fs.statSync(imageDefault).size;
var imagenesFiltradas = [];

var mongoose = require("mongoose");
var Q = require('q');
mongoose.connect("mongodb://127.0.0.1:27017/casadellibro");

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

var libro = mongoose.model("libro", libroSchema);


var imagenes = fs.readdirSync('./images');
imagenes.forEach(function(item) {
	var imageAux = fs.statSync('images/' + item).size;
	if(imageAux === imageSize) {
		item = item.slice(0, item.indexOf('.'));
		imagenesFiltradas.push(item)
	}
})

console.log(imagenesFiltradas)

for(var x = 0; x < imagenesFiltradas.length; x++) {
	libro.findOne({ isbn: imagenesFiltradas[x] }, function (err, doc){
	  if(!err) {
	  	doc.picUrl = '';
	  	doc.save();
	  }
	});
}