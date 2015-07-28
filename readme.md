crawler de e-commerce tipo cuspide, casa del libro.
el punto de entrada es crawler.js

ejemplo de uso: 
./crawler.js --debug true --url "http://www.casadellibro.com/libros/ciencias-humanas/104000000/2/1" --identificador ciencias-humanas --inicio 1 --final 50

ese script recorre las primeras 50 paginas del paginado de la url que se le pasa como parametro, guarda items en mongodb.

removeDefaultImages.js borra las imagenes por defecto que se hallan descargado, y limpia la db de las imagenes por defecto.

generadorCsv.js genera el csv a partir de la base de datos, se le pueden pasar filtros.
