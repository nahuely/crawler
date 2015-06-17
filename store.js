var request = require('request');
var config = require('./config');
var urlParser = require('url');
var Q = require('q');
var cheerio = require('cheerio')
var async = require('async');
var Book = require("./book");
var child = require("child_process").exec;

function Sitio(params) {
	if(params.url != undefined) {
		this.timeToGetBooks = 0;
		this.inicio = params.inicio;
		this.final = params.final;
		this.url = params.url;
		this.fecha = new Date();
		this.dominio = '';
		this.links = [];
		this.nombre = '';
		this.codigo = '';
		this.linksLen = 0;
		this.debug = params.debug;
		this.errors = [];
		this.identificador = params.identificador;
		if(this.debug == 'true') console.log(this);
	}
	return false;
}

Sitio.prototype.getDominio = function() {
	var dominio = urlParser.parse(this.url);
	if(dominio.hostname != undefined) {
		this.dominio = dominio.hostname;
	}
	return this;
}

Sitio.prototype.getNombre = function() {
	var nombre = '';
	if(this.dominio) {
		switch(this.dominio) {
			case config.recursos.casaDelLibro.url:
				this.nombre = config.recursos.casaDelLibro.nombre;
				this.codigo = 'casaDelLibro';
				break;
		}
	}
	return this;
}

Sitio.prototype.getLinks = function(callback) {
	var that = this;
	var q = async.queue(function (task, callback) {
		that.getLinksPage(task)
			.then(function(data) {
				var result = that.parseLinksPage(data);
				if(result.length) {
					that.links = that.links.concat(result);
					callback();					
				}
			})
			.catch(function(err) {
				that.errors.push(err);
				callback(err);
			})
	}, 6);

	for(var x = this.inicio; x <= this.final; x++) {
		q.push(this.url + '?page=' + x);
	}

	q.drain = function(err) {
		that.linksLen = that.links.length;
	  	callback();
	}
}

Sitio.prototype.getLinksPage = function(url) {
	var deferred = Q.defer();
	var options = {
		headers: {
	    	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
	  	},
	  	url: url
	}

	request(options, function(err, res, body) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(body);
		}
	})
	return deferred.promise;
}

Sitio.prototype.parseLinksPage = function(data) {
	var result = [];
	$ = cheerio.load(data);
	var links = $('div.mod-list-item div.txt > a');
	var linksLen = links.length;
	for(var x = 0; x < linksLen; x++) {
		result.push($(links[x]).attr('href'));
	}
	return result;
}

Sitio.prototype.getLibros = function() {
	var that = this;
	if(this.links) {
		var tiempoInicial = new Date();
		var q = async.queue(function (task, callback) {
			that.getBookData('casperjs' + ' ' + 'getDetail.js' + ' ' + that.dominio + task + ' ' + JSON.stringify(config.recursos[that.codigo]) + ' ' + that.codigo, {encoding: 'utf-8'})
				.then(function(data) {
					console.log("asdas");
					callback();
				})
				.catch(function(err) {
					callback("asdas");
				})
		}, 4);

		for(var x = 0; x < this.linksLen; x++) {
			console.log(this.links[x])
			q.push(this.links[x]);
		}

		q.drain = function(err) {
			console.log("termino de bajar todos los libros")
			var tiempoFinal = new Date();
			that.timeToGetBooks = (tiempoFinal.getTime() - tiempoInicial.getTime()) / 1000;
			//this.porcentajeDescargado = (this.librosLen * 100) / this.linksLen;
		}
	}
}

Sitio.prototype.getBookData = function(comand, options) {
	var deferred = Q.defer();

	child(comand, options, function(error, stdout, stderr) {
		if (error) {
	    	deferred.reject(error);
	    }

	    deferred.resolve(JSON.parse(stdout));    
		return deferred.promise;
	})
}

module.exports = Sitio;