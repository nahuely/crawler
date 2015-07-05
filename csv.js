var fs = require("fs");
var mongoose = require("mongoose");
var Q = require('q');
mongoose.connect("mongodb://127.0.0.1:27017/casadellibro");
var merge = require('merge');
var htmlencode = require('htmlencode');

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

var libroDb = mongoose.model("libro", libroSchema);

function Csv(identificador, output, debug, filtro, porcentaje, ebayCategory, storeCategory) {
	this.identificador = identificador;
	this.output = output;
	this.debug = debug;
	this.filtro = filtro;
	this.porcentaje = porcentaje;
	this.ebayCategory = ebayCategory;
	this.storeCategory = storeCategory;
	this.query = merge(JSON.parse(this.filtro), {identificador: this.identificador});
	this.baseUrl = 'http://brightestbooks.tk/images/';

}

Csv.prototype.calcularPrecio = function(precio) {
	return Math.round(precio * ((this.porcentaje / 100) + 1));
}

Csv.prototype.calcularCostoEnvio = function(paginas, encuadernacion, precio) {
	var paginas = parseInt(paginas) || 0;
	var encuadernacion = encuadernacion || '';
	var costo = 15;
	if(!encuadernacion && !paginas && precio < 12) {
		return 17;
	} else if(!encuadernacion && !paginas && precio >= 12) {
		return 22;
	}

	if(paginas) {
		if(paginas < 400) {
			costo = 15;
		} else if(paginas >= 400 && paginas <= 650) {
			costo = 20;
		} else if(paginas > 650 && paginas <= 900) {
			costo = 25;
		} else {
			costo = 30;
		}
	}

	if(!encuadernacion) {
		return costo;
	} else {
		switch(encuadernacion) {
			case 'tapa blanda':
			case 'tapa blanda bolsillo':
				if(costo === 30 || costo === 25) {
					return 25;
				}
				return costo;
				break;
			default:
				return costo;
		}
	}	
}

Csv.prototype.generarCsv = function(json) {
	var colums = ["*Action(SiteID=Spain|Country=ES|Currency=EUR|Version=745)","Product:ISBN","Title","Description","*ConditionID","PicURL","*Quantity","*Format","*StartPrice","*Duration","HitCounter","ImmediatePayRequired","*Location","GalleryType","PayPalAccepted","PayPalEmailAddress","Category","ShippingDiscountProfileID","InternationalShippingDiscountProfileID","ShippingType","ShippingService-1:Option","ShippingService-1:Cost","ShippingService-1:FreeShipping","ShippingService-1:Priority","DispatchTimeMax","ReturnsAcceptedOption","ReturnsWithinOption","ShippingCostPaidBy","MeasurementUnit","IntlShippingService-1:Option","IntlShippingService-1:Cost","IntlShippingService-1:Locations","IntlShippingService-1:Priority","IntlAddnlShiptoLocations","ListingDesigner:LayoutID","ListingDesigner:ThemeID","ShipToLocations","StoreCategory"];
	var breakLine = "\n";
	var string = colums.join(',') + breakLine;
	var jsonLen = json.length;

	for(var x = 0; x < jsonLen; x++) {
		if(json[x]) {
			var envio = this.calcularCostoEnvio(json[x].paginas, json[x].encuadernacion, json[x].precio);
			var precio = this.calcularPrecio(json[x].precio) + envio;

			descAux = '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font size="5" face="Verdana"><b>Descripci&#243;n del art&#237;culo/Article Description</b></font></p>';
			descAux += json[x].titulo ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font size="4" face="Verdana">T&#237;tulo/Title:<b>{{titulo}}</b></font></p>'.replace('{{titulo}}', htmlencode.htmlEncode(json[x].titulo)) : '';
			descAux += json[x].isbn ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><span style="font-family: Verdana; font-size: large;">ISBN:&nbsp;</span><font color="#000000" style="font-family: Verdana; font-size: large;"><b>{{isbn}}</b></font></p>'.replace('{{isbn}}', json[x].isbn) : '';
			descAux += json[x].autor ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font size="4" face="Verdana">Autor(es)/Author(s):&nbsp;<font color="#000000"><b>{{autor}}</b></font><br></font></p>'.replace('{{autor}}', htmlencode.htmlEncode(json[x].autor)) : '';
			descAux += json[x].editorial ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font size="4" face="Verdana">Editorial/Publisher:&nbsp;<font color="#000000"><b>{{editorial}}</b></font><br></font></p>'.replace('{{editorial}}', htmlencode.htmlEncode(json[x].editorial).toUpperCase()) : '';
			descAux += json[x].paginas ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font size="4" face="Verdana">N&#250;mero de P&#225;ginas/Number of Pages:&nbsp;<font color="#000000"><b>{{paginas}}</b></font></font></p>'.replace('{{paginas}}', json[x].paginas) : '';
			descAux += json[x].encuadernacion ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><font face="Verdana" size="4">Encuadernaci&#243;n/Binding:<b>{{encuadernacion}}</b></font></p>'.replace('{{encuadernacion}}', htmlencode.htmlEncode(json[x].encuadernacion).toUpperCase()) : '';
			descAux += json[x].idioma ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><span style="font-family: Verdana; font-size: large;">Idioma/Language:&nbsp;</span><font color="#000000" style="font-family: Verdana; font-size: large;"><b>{{idioma}}</b></font></p>'.replace('{{idioma}}', htmlencode.htmlEncode(json[x].idioma).toUpperCase()) : '';
			descAux += json[x].descripcion ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><span style="font-family: Verdana; font-size: large;"><b>Sinopsis/Synopsis:&nbsp;</b></span></p>' : '';
			descAux += json[x].descripcion ? '<p align="center" style="margin-bottom: 0.49cm; direction: ltr; widows: 2; orphans: 2;"><span style="font-family: Verdana; font-size: large;">{{descripcion}}</span></p>'.replace('{{descripcion}}', htmlencode.htmlEncode(json[x].descripcion)) : '';

			string += "Add,";
			string += json[x]._id + ",";
			string += "\"" + htmlencode.htmlEncode(json[x].titulo) + "\"" + ",";
			string += "\"" + descAux + "\"" + ",";
			string += "1000,";
			string += this.baseUrl + json[x].isbn + '.jpg' + "," || ",";
			string += "1,";
			string += "FixedPriceItem,";
			string += precio + "," || ",";
			string += "GTC,";//duracion
			string += "HiddenStyle,";
			string += "1,";
			string += "\"" + "Barcelona" + "\"" + ",";
			string += "Plus,";
			string += "1,";
			string += "danteiltano21@hotmail.com,";
			string += this.ebayCategory + ",";//categoria
			string += "0||,";
			string += "0||,";
			string += "Flat,";
			string += "ES_StandardDeliveryFromAbroad,";
			string += ",";
			string += "1,";
			string += "1,";
			string += "3,";
			string += "ReturnsAccepted,";
			string += "Days_14,";
			string += "Buyer,";
			string += "English,";
			string += "ES_StandardInternational,";
			string += "0,";
			string += "Worldwide,";
			string += "1,";
			string += "Worldwide,";
			string += "18610000,";
			string += "18610,";
			string += "Worldwide,";
			string += this.storeCategory;
			string += breakLine;
		}
	}
	return string;
}

Csv.prototype.crearArchivo = function(string) {
	var deferred = Q.defer();
	fs.writeFile(this.output, string, function(err) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve();
		}
	})
	return deferred.promise;
}

Csv.prototype.getLibros = function() {
	var deferred = Q.defer();
	libroDb.find(this.query, function(err, docs) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(docs);
		}
	})
	return deferred.promise;
}

module.exports = Csv;