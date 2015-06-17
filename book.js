var config = require("./config");
var fs = require("fs");
var request = require("request");
var child = require("child_process").exec;
var mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/casadellibro");

var libroSchema = new mongoose.Schema({
	_id: String,
	titulo: String,
	tituloLibreria: String,
	subtituloLibreria: String,
	autor: String,
	precio: Number,
	libreria: String,
	editorial: String,
	peso: Number,
	paginas: Number,
	descripcion: String,
	envio: Number,
	url: String,
	thumbnail: String,
	picUrl: String,
	ratio: Number,
	fecha: Date,
	ebayCategory: Number,
	storeCategory: Number,
	identificador: String
});

var libro = mongoose.model("libro", libroSchema);

function Book(data, ratio, nombre, codigoLibreria, ebayCategory, storeCategory, identificador) {
	this.data = data;
	this.libreria = nombre || "";
	this.ratio = ratio;
	this.precio = 0;
	this.titulo = "";
	this.subtitulo = this.data.subtitulo || ""; 
	this.editorial = this.data.editorial || "";
	this.peso = parseInt(this.data.gramos, 10) || 0;
	this.paginas = parseInt(this.data.paginas, 10) || 0;
	this.descripcion = this.data.descripcion || "";
	this.autor = "";
	//this.isbn = crypto.createHash("md5").update(this.data.isbn).digest("hex");
	this.isbn = this.data.isbn || 0;
	this.envio = 0;
	this.picUrl = "";
	this.thumbnail = this.data.thumbnail || "";
	this.url = this.data.url || "";
	this.tieneImagen = false;
	this.codigo = codigoLibreria;
	this.ebayCategory = ebayCategory || 100;
	this.storeCategory = storeCategory || 100;
	this.identificador = identificador || new Date().getTime();
}

Book.prototype.generarAutor = function() {
	var autorLen = this.data.autores.length;
	var autorStr = "";
	for(var x = 0; x < autorLen; x++) {
		var autor = this.data.autores[x];
		autor = autor.replace(/[,.]/g, "");
		if(x == autorLen -1) {
			autorStr += autor;
		} else {
			autorStr += autor + ", ";
		}
	}
	this.autor = autorStr.toUpperCase();
	return this;
}

Book.prototype.descargarFoto = function() {
	var archivo = config.general.imagenes.thumbnail + this.isbn + "." + config.general.formatoImagen;
	if(this.thumbnail.indexOf(config.recursos[this.codigo].sinImagen) == -1) {
		var comando = 'curl -o "' + archivo + '" -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X)" "' + this.thumbnail + '"';
		try {
			var result = child(comando, {"timeout": 2000});
			if(result) {
				var infoArchivo = fs.statSync(archivo);
				if(infoArchivo.size == 8350 || infoArchivo.size == 8192) {
					fs.unlinkSync(archivo);
					this.picUrl = config.general.noImage;
					this.tieneImagen = false;
					this.thumbnail = "";
				} else {
					var formato = "file "  + archivo;
					var resultFormato = child(formato, {"timeout": 2000});
					if(resultFormato.toString().indexOf("PNG") == -1) {
						this.picUrl = config.general.webUrl + this.isbn + "." + config.general.formatoImagen;
						this.thumbnail = config.general.webUrl + "thumbnail_" + this.isbn + "." + config.general.formatoImagen;
						this.tieneImagen = true;
					} else {
						fs.unlinkSync(archivo);
						this.picUrl = config.general.noImage;
						this.tieneImagen = false;
						this.thumbnail = "";	
					}
				}

			} else {
				this.picUrl = config.general.noImage;
				this.tieneImagen = false;
				this.thumbnail = "";	
			}
		} catch(e) {
			this.picUrl = config.general.noImage;
			this.tieneImagen = false;
			this.thumbnail = "";
		}
	} else {
		this.picUrl = config.general.noImage;
		this.tieneImagen = false;
		this.thumbnail = "";
	}
}

Book.prototype.generarTitulo = function() {
	var delimitador = " - ";
	var espacio = " ";
	if(this.data.titulo != undefined) {
		if((this.subtitulo.length > 0) && (this.autor.length > 0) && ((this.autor.length + this.subtitulo.length + espacio.length + delimitador.length + this.data.titulo.length) <= 80)) {
			this.titulo = (this.data.titulo + espacio + this.subtitulo + delimitador + this.autor).toUpperCase();
		} else if((this.autor.length > 0) && ((this.data.titulo.length + delimitador.length + this.autor.length) <= 80)) {
			this.titulo = (this.data.titulo + delimitador + this.autor).toUpperCase(); 
		} else if((this.subtitulo.length > 0) && ((this.data.titulo.length + delimitador.length + this.subtitulo.length) <= 80)) { 
			this.titulo = (this.data.titulo + delimitador + this.subtitulo).toUpperCase();
		} else if((this.editorial.length > 0) && ((this.data.titulo.length + delimitador.length + this.editorial.length) <= 80)) {
			this.titulo = (this.data.titulo + delimitador + this.editorial).toUpperCase();
		} else {
			this.titulo = (this.data.titulo).toUpperCase();
		}
	}
	return this;
}

Book.prototype.guardarLibro = function() {
		var libroNuevo = "";
		try {
			libroNuevo = new libro({
				_id: this.isbn,
				titulo: this.titulo,
				tituloLibreria: this.data.titulo,
				subtituloLibreria: this.data.subtitulo,
				autor: this.autor,
				precio: this.precio,
				libreria: this.libreria,
				editorial: this.editorial,
				peso: this.peso,
				paginas: this.paginas,
				descripcion: this.descripcion,
				envio: this.envio,
				url: this.url,
				thumbnail: this.thumbnail,
				picUrl: this.picUrl,
				ratio: this.ratio,
				fecha: new Date(),
				ebayCategory: this.ebayCategory,
				storeCategory: this.storeCategory,
				identificador: this.identificador
			});
		} catch(e) {
			console.log("no funciono")
		}

		if(libroNuevo) {
			libroNuevo.save(function(err, doc) {
				if(!err) {
					console.log("\nSe descargo el libro con isbn:" + doc._id + "\n");
				} else {
					console.log("\nNo se pudo descargar por que esta duplicado");
				}
			})
		}
}

module.exports = Book;
