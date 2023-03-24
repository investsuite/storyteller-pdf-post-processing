const { interpretContentStream } = require('./pdf-interpreter');
const { byteArrayToHexString } = require('./conversion');
const chalk = require('chalk');

function logTextElements({
    pdfReader,
    pageDictionary,
    resources,
}) {
    const contents = pageDictionary.exists('Contents') ?
        pdfReader.queryDictionaryObject(pageDictionary, ('Contents'))
        : null;

    if (!contents)
        return [];

    // results get added to this list by the operatorHandler
    const allTextElements = [];

    // Loops over all the elements (named operators and operands) and adds the relevant text to the result list
    interpretContentStream({
        objectParser: pdfReader.startReadingObjectsFromStream(contents.toPDFStream()),
        onOperatorHandler: getOnOperatorHandler({
            resources,
            modifiableListToAppendResultsTo: allTextElements,
        }),
    });

    console.log(chalk.cyan('\nAll text elements on the first page:'));
    console.log(allTextElements);
}

function getOnOperatorHandler({
    resources,
    modifiableListToAppendResultsTo
}) {
    let currentTextElement = {};

    return (operatorName, operands) => {
        switch (operatorName) {
            // Begin text operator
            case 'BT': {
                currentTextElement = {};
                break;
            }

            // Text font operator
            case 'Tf': {
                // first param is font size, but we don't need this
                const size = operands.pop();

                const fontName = operands.pop();
                if (resources.fonts[fontName.value]) {
                    currentTextElement.fontObjectId = resources.fonts[fontName.value]?.objectId;
                }
                break;
            }

            // Text content operator
            case 'Tj': {
                const param = operands.pop();
                currentTextElement.asBytes = JSON.stringify(param.toBytesArray());
                currentTextElement.asHexString = byteArrayToHexString(param.toBytesArray());
                break;
            }

            // End text operator
            case 'ET': {
                modifiableListToAppendResultsTo.push(currentTextElement);
                break;
            }

            // If any other operator, ignore
            default:
                break;
        }
    };
}

module.exports = {
    logTextElements,
};
