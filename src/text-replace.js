const chalk = require('chalk');
const { FontDecoding } = require('./font-decoding');
const { hexStringToByteArray, stringToByteArray, byteArrayToHexString } = require('./conversion');

function replaceText({
    pdfWriter,
    pdfReader,
    resources,
    findString,
    replaceString,
}) {
    const { error, fontObjectId } = getFontOfFindString({ pdfReader, findString, resources });
    if (error) {
        return { success: false, error };
    }

    const fontDecoder = getFontDecoder({ objectId: fontObjectId, pdfReader });

    const findStringAsBytes = fontDecoder.getBytesFromString(findString);
    const findStringAsHexString = byteArrayToHexString(findStringAsBytes);
    const findStringAsHexStringInPdf = padHexStringWith00s(findStringAsHexString);

    const replaceStringAsBytes = fontDecoder.getBytesFromString(replaceString);
    const replaceStringAsHexString = byteArrayToHexString(replaceStringAsBytes);
    const replaceStringAsHexStringInPdf = padHexStringWith00s(replaceStringAsHexString);

    const copyingContext = pdfWriter.createPDFCopyingContextForModifiedFile();
    const objectsContext = pdfWriter.getObjectsContext();

    // Only first (cover) page is relevant
    const pageObject = copyingContext.getSourceDocumentParser().parsePage(0);
    const pdfPageContentsAsString = getPdfContentsAsString({ copyingContext, pageObject });

    if (!pdfPageContentsAsString.includes(findStringAsHexStringInPdf)) {
        return {
            success: false,
            error: `Could not find string "${findString}" in PDF.`
        }
    }

    const newPdfPageContentsAsString = pdfPageContentsAsString.replace(findStringAsHexStringInPdf, replaceStringAsHexStringInPdf);

    const textObjectID = pageObject.getDictionary().toJSObject().Contents.getObjectID();

    // Create what will become our new text object
    objectsContext.startModifiedIndirectObject(textObjectID);

    const stream = pdfWriter.getObjectsContext().startPDFStream();
    stream.getWriteStream().write(stringToByteArray(newPdfPageContentsAsString));
    objectsContext.endPDFStream(stream);

    objectsContext.endIndirectObject();

    pdfWriter.end();

    return { success: true };
}

/**
 * This is a workaround because the getBytesFromString is not fully implemented and does not
 * return the 0 bytes at the front of every byte array correctly. See comments in getBytesFromString.
 * In the future this should become obsolete and removed.
 */
function padHexStringWith00s(str) {
    return [...str].map((char, index) => {
        const isEven = index % 2 === 0;
        if (isEven) {
            return `00${char}`;
        }
        return char;
    }).join('');
}

function getFontOfFindString({
    findString,
    resources,
    pdfReader,
}) {
    const fontKeyOfFindString = Object.keys(resources.fonts).find((key) => {
        const fontDecoder = getFontDecoder({ objectId: resources.fonts[key]?.objectId, pdfReader });

        const bytesToTranslate = fontDecoder.getBytesFromString(findString);
        const translation = fontDecoder.translate(bytesToTranslate).result;

        return translation === findString;
    });

    if (!fontKeyOfFindString) {
        return {
            error: `Could not find font for string to replace ("${findString}"). Unable to perform text replacement.`,
            fontObjectId: null,
        };
    }

    return { fontObjectId: resources.fonts[fontKeyOfFindString]?.objectId };
}

function getPdfContentsAsString({
    copyingContext,
    pageObject,
}) {
    const textStream = copyingContext.getSourceDocumentParser().queryDictionaryObject(pageObject.getDictionary(), 'Contents');

    let data = [];
    const contentStream = copyingContext.getSourceDocumentParser().startReadingFromStream(textStream);
    while (contentStream.notEnded()) {
        const readData = contentStream.read(10000);
        data = data.concat(readData);
    }

    return Buffer.from(data).toString();
}

function getFontDecoder({
    pdfReader,
    objectId,
}) {
    const fontObject = pdfReader.parseNewObject(objectId).toPDFDictionary();
    return new FontDecoding(pdfReader, fontObject);
}

module.exports = {
    replaceText,
};
