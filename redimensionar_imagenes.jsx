#target photoshop

// Seleccionar carpeta de entrada
var inputFolder = Folder.selectDialog("Selecciona la carpeta con las imágenes");

// Seleccionar carpeta de salida
var outputFolder = Folder.selectDialog("Selecciona la carpeta donde se guardarán las imágenes");

if (inputFolder && outputFolder) {
    var files = inputFolder.getFiles(/\.(jpg|jpeg|png|tif|tiff)$/i);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file instanceof File) {
            open(file);
            var doc = app.activeDocument;

            // Asegurar que el documento esté activo
            app.activeDocument = doc;

            // Verificar si el documento tiene canales alfa (transparencia)
            if (doc.channels.length > 3) {
                // Crear una nueva capa debajo y rellenarla de blanco
                var whiteLayer = doc.artLayers.add();
                whiteLayer.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
                app.activeDocument.selection.selectAll();
                app.activeDocument.selection.fill(app.foregroundColor = new SolidColor());
                app.foregroundColor.rgb.red = 255;
                app.foregroundColor.rgb.green = 255;
                app.foregroundColor.rgb.blue = 255;
                app.activeDocument.selection.deselect();
                whiteLayer.name = "Fondo Blanco";
                whiteLayer.opacity = 100;
            }

            // Obtener dimensiones originales
            var originalWidth = doc.width;
            var originalHeight = doc.height;

            // Calcular el factor de escala para encajar en 500x500 sin deformar
            var scaleFactor = Math.min(500 / originalWidth, 500 / originalHeight);

            // Ajustar tamaño proporcionalmente
            doc.resizeImage(originalWidth * scaleFactor, originalHeight * scaleFactor);

            // Crear un nuevo documento de 500x500 px
            var newDoc = app.documents.add(500, 500, doc.resolution, "Lienzo_500x500", NewDocumentMode.RGB);

            // Seleccionar la imagen escalada y copiarla
            app.activeDocument = doc;
            doc.selection.selectAll();
            doc.selection.copy();
            doc.close(SaveOptions.DONOTSAVECHANGES);

            // Pegar la imagen en el nuevo lienzo
            app.activeDocument = newDoc;
            newDoc.paste();
            var pastedLayer = newDoc.activeLayer;

            // Centrar la imagen
            var bounds = pastedLayer.bounds;
            var layerWidth = bounds[2] - bounds[0];
            var layerHeight = bounds[3] - bounds[1];
            var xOffset = (500 - layerWidth) / 2 - bounds[0];
            var yOffset = (500 - layerHeight) / 2 - bounds[1];
            pastedLayer.translate(xOffset, yOffset);

            // Guardar la imagen en la carpeta de salida
            var saveFile = new File(outputFolder + "/" + file.name.replace(/\.[^\.]+$/, ".jpg"));
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 12;
            newDoc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
            newDoc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
    alert("Proceso completado. Imágenes guardadas en: " + outputFolder);
} else {
    alert("Operación cancelada.");
}
