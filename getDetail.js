var casper = require("casper").create({pageSettings: {loadImages:  false, loadPlugins: false}});
casper.options.waitTimeout = 1000;
var utils = require("utils");

var url = casper.cli.get(0);
var config = JSON.parse(casper.cli.get(1));
var libreria = casper.cli.get(2);


function getAttributes(url, config, libreria) {
	var libro = {};
	
	function estaEnTexto(mensaje, texto) {
		if(mensaje.length != 0) {
		 	if(texto.indexOf(mensaje) == 0) {
				return true;  
			}
		}
		return false;	
	}

	function resolverExpresion(tag, re) {
		var regex = new RegExp(re.replace(/K/g, "\\"), "im");
		var nodo = document.querySelector(tag);
		if(nodo != null) {
			var valNodo = nodo.innerText;
			var result = valNodo.match(regex);
			if(result) {
				return result[1].trim();
			}
		}
		return "";
	}

	function removeDot(string) {
		if(string != undefined) {
			var result = string.replace(".", "");
			return result;
		}
		return "";
	}
	
	return {"data": url};
}

casper.start(url);
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.then(function() {
	utils.dump(this.evaluate(getAttributes, url, config, libreria));
});

casper.run(function() {
	this.exit();
});
