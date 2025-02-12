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
            doc.selection.selectAll();
            doc.selection.copy();
            doc.close(SaveOptions.DONOTSAVECHANGES);

            // Pegar la imagen en el nuevo lienzo
            newDoc.paste();
            var pastedLayer = newDoc.activeLayer;

            // Centrar la imagen
            pastedLayer.translate((500 - pastedLayer.bounds[2]) / 2, (500 - pastedLayer.bounds[3]) / 2);

            // Guardar la imagen en la carpeta de salida
            var saveFile = new File(outputFolder + "/" + file.name);
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
