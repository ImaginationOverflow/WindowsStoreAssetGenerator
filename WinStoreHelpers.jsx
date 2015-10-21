function centerLayer(layer, doc)
{
    app.activeDocument = doc;
    var bounds = layer.bounds;
    var layerWidth = Number(bounds[2] - bounds[0]);
    var layerHeight = Number(bounds[3] - bounds[1]);

    var docWidth = Number(doc.width);
    var docHeight = Number(doc.height);
    // calculate offsets
    var dX = (docWidth - layerWidth) / 2 - Number(bounds[0]);
    var dY = (docHeight - layerHeight) / 2 - Number(bounds[1]);

    // centers the active layer
    layer.translate(dX, dY);
}

function resizeAndAddToDoc(image, height, width, doc)
{
    app.activeDocument = image;
    var startState = image.activeHistoryState; //to use on the redo

    image.resizeImage(width, height, null, ResampleMethod.BICUBICSHARPER);


    image.artLayers.add();
    image.mergeVisibleLayers();

    // Add and center layer
    app.activeDocument = image;
    var layer = image.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
    centerLayer(layer, doc);

    //redo
    app.activeDocument = image;
    image.activeHistoryState = startState;
}

function saveImageAndCloseDoc(doc, destfile)
{
    var sfw = new ExportOptionsSaveForWeb();
    sfw.format = SaveDocumentType.PNG;
    sfw.PNG8 = false; // use PNG-24
    sfw.transparency = true;

    app.activeDocument = doc;
    doc.exportDocument(destfile, ExportType.SAVEFORWEB, sfw);
    doc.close(SaveOptions.DONOTSAVECHANGES);
}

///////////////////////////////////////////////////////////////////////////////
// findLayer - iterate through layers to find a match
// Source http://morris-photographics.com/photoshop/scripts/find-layer.html
///////////////////////////////////////////////////////////////////////////////
function findLayer(ref, name)
{
    // declare local variables
    var layers = ref.layers;
    var len = layers.length;
    var match = false;

    // iterate through layers to find a match
    for (var i = 0; i < len; i++)
    {
        // test for matching layer
        var layer = layers[i];
        if (layer.name.toLowerCase() == name.toLowerCase())
        {
            // select matching layer
            app.activeDocument.activeLayer = layer;
            match = true;
            break;
        }
        // handle groups (layer sets)
        else if (layer.typename == 'LayerSet')
        {
            match = findLayer(layer, name);
            if (match)
            {
                break;
            }
        }
    }
    return match;
}

function setVisibleOnLayer(doc, name, value)
{
    app.activeDocument = doc;
    if (findLayer(doc, name))
    {
        app.activeDocument.activeLayer.visible = value;
    }
}

function setBackgroundLayerVisible(doc, value, targetWidth, targetHeight)
{
    setVisibleOnLayer(doc, backgroundLayerName, value);
    if (value)
    {
        doc.activeLayer.resize(targetWidth, targetWidth, AnchorPosition.TOPLEFT)
    }
}


function setBackgroundColor(doc, color)
{
    app.activeDocument = doc;
    var theLayers = doc.layers;
    doc.activeLayer = theLayers[theLayers.length - 1];
    var aLayer = doc.activeLayer;

    if (aLayer.isBackgroundLayer)
    {
        app.activeDocument.selection.fill(color, ColorBlendMode.NORMAL, 100, false);
    }

}



function processAssets(appAssets)
{
    try
    {

        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;

        //
        //	Layer names for the title and background.
        //
        var backgroundLayerName = "Background";
        var appTitleLayerName = "AppTitle";

        //var tile = new File("D:\FAC/Programing/Projects/AdMesh/Design/Tile/Tile.psd");
        //var destFolder = new Folder("D:\PSTest/");

        //
        //	Retrieve the psd and the destination folder
        //
        var destFolder = Folder.selectDialog("Choose an output folder");
        var psdFile = File.openDialog("Select a sqaure PNG file that is at least 1024x1024.", "*.psd", false);
        var asset;

        var initialPrefs = app.preferences.rulerUnits; // will restore at end

        //
        //	Open the psd.
        //
        var psd = open(psdFile);


        //
        // A bool to reflect if the generation will use a single background color.
        //
        var useBackground = false;

        //
        //	If there is a BackgroundLayer
        //  Hammer the bg color discovery, by cecking the color of the first pixel.
        //
        if (findLayer(psd, backgroundLayerName))
        {
            var sampler = psd.colorSamplers.add([0, 0]);
            sampler.move([0, 0]);
            var bgColor = sampler.color;
            useBackground = true;
        }

        //
        //	Create the folder if it doesn't exist
        //
        var appAssetsFolder = destFolder;

        if (!appAssetsFolder.exists)
            appAssetsFolder.create();

        for (i = 0; i < appAssets.length; i++)
        {

            asset = appAssets[i];

            //
            //	Temporary variables.
            //
            var assetWidth = asset.width != null ? asset.width : asset.size;
            var assetHeight = asset.height != null ? asset.height : asset.size;
            var createDocWithBg = asset.background != null && asset.background;

            //
            //	Create a temporary psd to generate the target asset.
            //
            var newDoc = app.documents.add(assetWidth, assetHeight, 72.0, asset.name, NewDocumentMode.RGB, createDocWithBg ? DocumentFill.BACKGROUNDCOLOR : DocumentFill.TRANSPARENT);

            //
            //	Set as visible the psd layers; Background and Title to the temp psd if the asset requires it and the layer exists.
            //
            setVisibleOnLayer(psd, backgroundLayerName, asset.background == null ? false : asset.background);
            setVisibleOnLayer(psd, appTitleLayerName, asset.title == null ? false : asset.title);

            //
            //	Resize and center everything and copy it to the new psd.
            //
            resizeAndAddToDoc(psd, asset.size, asset.size, newDoc);

            if (useBackground)
                setBackgroundColor(newDoc, bgColor)

            //
            //	Finally save the psd in a new file.
            //
            var destFileName = asset.name + ".png";
            saveImageAndCloseDoc(newDoc, new File(appAssetsFolder + "/" + destFileName));

        }

        //
        //	Close the original psd without saving any changes.
        //
        psd.close(SaveOptions.DONOTSAVECHANGES);

    }
    catch (exception)
    {
        if ((exception != null))
            alert(exception);
    }
    finally
    {
        if (psd != null)
            psd.close(SaveOptions.DONOTSAVECHANGES);

        app.preferences.rulerUnits = initialPrefs;
    }
}
