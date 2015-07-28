'use strict';

var config = require('./config');
var mongoose = require('mongoose');
var Q = require('q');
mongoose.connect(config.db);

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

function Book(data, libreria, identificador) {
	this.isbn = data.isbn || '';
	this.precio = data.precio || '';
	this.titulo = data.titulo || '';
	this.precio = data.precio || '';
	this.autor = data.autor || '';
	this.libreria = libreria;
	this.editorial = data.editorial || '';
	this.idioma = data.idioma || '';
	this.descripcion = data.descripcion || '';
	this.encuadernacion = data.encuadernacion || '';
	this.paginas = data.paginas || '';
	this.url = data.url || '';
	this.picUrl = data.imgGrande || '';
	this.fecha = new Date();
	this.identificador = identificador || '';
	this.formato = data.formato || '';
	this.status = data.status || '';
}

Book.prototype.guardarLibro = function() {
	var deferred = Q.defer();

	var libroNuevo = new libro({
			_id: this.isbn,
			isbn: this.isbn,
			titulo: this.titulo,
			precio: this.precio,
			autor: this.autor,
			libreria: this.libreria,
			editorial: this.editorial,
			idioma: this.idioma,
			descripcion: this.descripcion,
			encuadernacion: this.encuadernacion,
			paginas: this.paginas,
			url: this.url,
			picUrl: this.picUrl,
			fecha: this.fecha,
			identificador: this.identificador,
			formato: this.formato,
			status: this.status
		});

	libroNuevo.save(function(err, doc) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(doc);
		}
	})
	return deferred.promise;
}

module.exports = Book;
