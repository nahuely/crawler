var casper = require("casper").create({pageSettings: {loadImages:  false, loadPlugins: false}});
casper.options.waitTimeout = 1500;
//casper.options.retryTimeout = 80;
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
		if(autoresLength) {
			for(var x = 0; x < autoresLength; x++) {
				if(x === autoresLength - 1) {
					result += autores[x].innerText + '';
				} else {
					result += autores[x].innerText + ', ';
				}
			}	
		}		
		return result;
	}

	function getDescripcion() {
		var result = getString(config.html.descripcion, 'txt');
		if(result) {
			result = result.replace(/(")/gm, function(x) {
				switch(x) {
					case '"':
						return '\'';
				}
			});
		}
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
		if(listaLength) {
			for(var x = 0; x < listaLength; x++) {
				var result;
				var item = lista[x];
				var propiedad = item.childNodes[0].textContent.trim();
				var validPro = item.childNodes.length;
				if(propiedad && validPro > 1) {
					switch(propiedad) {
						case 'Nº de páginas:':
							result = item.childNodes[1];
							libro.paginas = result ? result.textContent.replace(/[^\d]/g, '') : '';
							break;
						case 'Editorial:':
							result = item.childNodes[2];
							libro.editorial = result ? result.textContent.toLowerCase().trim() : '';
							break;
						case 'Encuadernación:':
							result = item.childNodes[1];
							libro.encuadernacion = result ? result.textContent.toLowerCase().trim() : '';
							break;
						case 'Lengua:':
							result = item.childNodes[1];
							libro.idioma = result ? result.textContent.toLowerCase().trim() : '';
							break;
						case 'ISBN:':
							result = item.childNodes[1];
							libro.isbn = result ? result.textContent.trim() : '';
							break;
						case 'Año edición:':
							result = item.childNodes[1];
							libro.edicion = result ? result.textContent.trim() : '';
							break;
					}					
				}
			}			
		}
	}

	var libro = {};
	libro.precio = getPrecio();
	libro.titulo = getTitulo();

	if(libro.precio && libro.titulo) {
		libro.autor = getAutores();
		libro.formato = getFormato();
		libro.status = getStatus();
		libro.thumbnail = getThumbnail();
		libro.imgGrande = libro.thumbnail ? getImgGrande() : '';
		libro.descripcion = getDescripcion();
		ulToJson();
		libro.url = url;		
	} else {
		libro = null;
	}
	
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
