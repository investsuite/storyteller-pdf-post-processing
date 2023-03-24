const chalk = require('chalk');
const hummus = require('muhammara');
const { MultiDictHelper } = require('./multi-dict-helper');

// unique id provider for font decoding
let uniqueId = 0;

function getResources({ pageDictionary, pdfReader }) {
    const resourcesDicts = getResourcesDictionaries({ pageDictionary, pdfReader });

    const fonts = {};

    if (resourcesDicts.exists('Font')) {
        const fontsEntry = resourcesDicts.queryDictionaryObject('Font', pdfReader);
        if (!!fontsEntry) {
            const fontsJS = fontsEntry.toPDFDictionary().toJSObject();
            Object.keys(fontsJS).forEach((fontName) => {
                const fontReference = fontsJS[fontName];
                let font;
                if (fontReference.getType() === hummus.ePDFObjectIndirectObjectReference) {
                    font = { objectId: fontReference.toPDFIndirectObjectReference().getObjectID() };
                }
                else {
                    font = { embeddedObjectId: 'embeddedId_' + uniqueId, embeddedObject: fontReference.toPDFDictionary() };
                    ++uniqueId;
                }
                fonts[fontName] = font;
            });
        }
    }

    return {
        fonts,
    };
}

function getResourcesDictionaries({ pageDictionary, pdfReader }) {
    // gets an array of resources dictionaries, going up parents.
    const resourcesDicts = [];
    while (!!pageDictionary) {
        const dict = getResourcesDictionary();
        if (dict)
            resourcesDicts.push(dict);

        if (pageDictionary.exists('Parent')) {
            const parentDict = pdfReader.queryDictionaryObject(pageDictionary, 'Parent');
            if (parentDict.getType() === hummus.ePDFObjectDictionary)
                pageDictionary = parentDict.toPDFDictionary();
            else
                pageDictionary = null;
        }
        else
            pageDictionary = null;
    }

    return new MultiDictHelper(resourcesDicts);

    function getResourcesDictionary() {
        return pageDictionary.exists('Resources') ?
            pdfReader.queryDictionaryObject(pageDictionary, 'Resources').toPDFDictionary()
            : null;
    }
}

module.exports = {
    getResources,
};
