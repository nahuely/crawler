var casper = require("casper").create({pageSettings: {loadImages:  false, loadPlugins: false}});
casper.options.waitTimeout = 600;
casper.options.retryTimeout = 30;
casper.options.silentErrors = false;

var utils = require("utils");

var url = casper.cli.get(0);
var config = JSON.parse(casper.cli.get(1));
var libreria = casper.cli.get(2);

function getAttributes(url, config, libreria) {

	function getString(selector, typeOfAttr) {
		var node = document.querySelector(selector);
		var result = '';
		var attr = typeOfAttr || '';
		if(node !== null) {
			switch(attr) {
				case 'txt':
					result = node.textContent.trim();
					break;
				case 'href':
					result = node.getAttribute('href').trim();
					break;
				case 'src':
					result = node.getAttribute('src').trim();
					break;
				case 'nodeTxt':
					result = node.childNodes[0].textContent.trim();
					break;
			}
		}
		return result;
	}

	function getStringArr(selector) {
		return document.querySelectorAll(selector);
	}
	
	function getTitulo() {
		return getString(config.html.titulo, 'nodeTxt');
	}

	function getAutores() {
		var autores = getStringArr(config.html.autores);
		var autoresLength = autores.length;
		var result = '';
		for(var x = 0; x < autoresLength; x++) {
			if(x === autoresLength - 1) {
				result += autores[x].innerText + '';
			} else {
				result += autores[x].innerText + ', ';
			}
		}
		return result;
	}

	function getDescripcion() {
		var result = getString(config.html.descripcion, 'txt');
		result = result.replace(/("|\n)/gm, function(x) {
			switch(x) {
				case '\n':
					return '<br>';
				case '"':
					return '\'';
			}
		});
		return result;
	}

	function getPrecio() {
		var result = getString(config.html.precio, 'nodeTxt');
		return Number(result.replace(/(\(|\)|€)/g, ''));
	}

	function getStatus() {
		var result = getString(config.html.status, 'nodeTxt');
	 	return result.toLowerCase();
	}

	function getFormato() {
		var result = getString(config.html.formato, 'txt');
		result = result.replace(/(\(|\))/g, '');
		return result.toLowerCase();
	}

	function getThumbnail() {
		var result = getString(config.html.thumbnail, 'src');
		if(result.indexOf(config.imagenInvalida) > -1) {
			result = '';
		}
		return result;
	}

	function getImgGrande() {
		var result = getString(config.html.imgGrande, 'src');
		result = result.replace(/t(\d)/, 't0');
		return result;
	}

	function ulToJson() {
		var lista = document.querySelectorAll(config.html.detalles);
		var listaLength = lista.length;
		for(var x = 0; x < listaLength; x++) {
			var item = lista[x];
			var propiedad = item.childNodes[0].innerText.trim();
			switch(propiedad) {
				case 'Nº de páginas:':
					libro.paginas = item.childNodes[1].textContent.replace(/[^\d]/g, '');
					break;
				case 'Editorial:':
					libro.editorial = item.childNodes[2].innerText.toLowerCase().trim();
					break;
				case 'Encuadernación:':
					libro.encuadernacion = item.childNodes[1].textContent.toLowerCase().trim();
					break;
				case 'Lengua:':
					libro.idioma = item.childNodes[1].textContent.toLowerCase().trim();
					break;
				case 'ISBN:':
					libro.isbn = item.childNodes[1].textContent.trim();
					break;
				case 'Año edición:':
					libro.edicion = item.childNodes[1].textContent.trim();
					break;
			}
		}
	}

	var libro = {};
	libro.titulo = getTitulo();
	libro.autor = getAutores();
	libro.formato = getFormato();
	libro.precio = getPrecio();
	libro.status = getStatus();
	libro.thumbnail = getThumbnail();
	libro.imgGrande = libro.thumbnail ? getImgGrande() : '';
	libro.descripcion = getDescripcion();
	libro.url = url;
	ulToJson();
	
	return libro;
}

casper.start(url);
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.then(function() {
	utils.dump(this.evaluate(getAttributes, url, config, libreria));
});

casper.run(function() {
	this.exit();
});
