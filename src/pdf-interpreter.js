const hummus = require('muhammara');

function interpretContentStream({
    objectParser,
    onOperatorHandler,
}) {
    let operandsStack = [];
    let pdfItem = objectParser.parseNewObject();

    while (!!pdfItem) {
        if (isOperator()) {
            onOperatorHandler(pdfItem.value, operandsStack.concat());
            operandsStack = [];
        }
        else { // is operand
            operandsStack.push(pdfItem);
        }
        pdfItem = objectParser.parseNewObject();

        function isOperator() {
            return pdfItem.getType() === hummus.ePDFObjectSymbol;
        }
    }
}

module.exports = {
    interpretContentStream,
}
