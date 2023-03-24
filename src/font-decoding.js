const chalk = require('chalk');
const hummus = require('muhammara');
const { stringToByteArray } = require('./conversion');
const { interpretContentStream } = require('./pdf-interpreter');

function besToUnicodes(inArray) {
    let i = 0;
    const unicodes = [];

    while (i < inArray.length) {
        const newOne = beToNum(inArray, i, i + 2);
        if (0xD800 <= newOne && newOne <= 0xDBFF) {
            // High surrogate, need to read another one.
            i += 2;
            const lowSurrogate = beToNum(inArray, i, i + 2);
            unicodes.push(0x10000 + ((newOne - 0xD800) << 10) + (lowSurrogate - 0xDC00));
        }
        else {
            unicodes.push(newOne);
        }
        i += 2;
    }

    return unicodes;
}

function beToNum(inArray, start, end) {
    let result = 0;
    start = start || 0;
    if (end === undefined) {
        end = inArray.length;
    }

    for (let i = start; i < end; ++i) {
        result = result * 256 + inArray[i];
    }
    return result;
}

function parseToUnicode(pdfReader, toUnicodeObjectId) {
    const map = {};
    // The interpreter class looking only for endbfrange and endbfchar as "operands"
    const stream = pdfReader.parseNewObject(toUnicodeObjectId).toPDFStream();
    if (!stream)
        return null;

    interpretContentStream({
        objectParser: pdfReader.startReadingObjectsFromStream(stream),
        onOperatorHandler: (operatorName, operands) => {
            if (operatorName === 'endbfchar') {
                // Operators are pairs. always of the form <codeByte> <unicodes>
                for (let i = 0; i < operands.length; i += 2) {
                    const byteCode = operands[i].toBytesArray();
                    const unicodes = operands[i + 1].toBytesArray();
                    map[beToNum(byteCode)] = besToUnicodes(unicodes);
                }
            }
            else if (operatorName === 'endbfrange') {
                // Operators are 3. two codesBytes and then either a unicode start range or array of unicodes
                for (let i = 0; i < operands.length; i += 3) {
                    const startCode = beToNum(operands[i].toBytesArray());
                    const endCode = beToNum(operands[i + 1].toBytesArray());

                    if (operands[i + 2].getType() === hummus.ePDFObjectArray) {
                        const unicodeArray = operands[i + 2].toPDFArray();
                        // specific codes
                        for (let j = startCode; j <= endCode; ++j) {
                            map[j] = besToUnicodes(unicodeArray.queryObject(j).toBytesArray());
                        }
                    }
                    else {
                        const unicodesDifferentNameToFixTyping = besToUnicodes(operands[i + 2].toBytesArray());
                        // code range
                        for (let j = startCode; j <= endCode; ++j) {
                            map[j] = unicodesDifferentNameToFixTyping.slice();
                            // increment last unicode value
                            ++unicodesDifferentNameToFixTyping[unicodesDifferentNameToFixTyping.length - 1];
                        }
                    }

                }
            }
        }
    });

    return map;
}


function parseFontData(self, pdfReader, fontObject) {
    const font = fontObject;
    if (!font)
        return;

    // parse translating information
    if (font.exists('ToUnicode')) {
        // to unicode map
        self.hasToUnicode = true;
        self.toUnicodeMap = parseToUnicode(pdfReader, font.queryObject('ToUnicode').toPDFIndirectObjectReference().getObjectID());;
    }
}


function toUnicodeEncoding(toUnicodeMap, bytes) {
    let result = '';

    let i = 0;
    while (i < bytes.length) {
        let value = bytes[i];
        i += 1;
        while (i < bytes.length && (toUnicodeMap[value] === undefined)) {
            value = value * 256 + bytes[i];
            i += 1;
        }
        result += String.fromCharCode.apply(String, toUnicodeMap[value]);
    }
    return result;
}


function FontDecoding(pdfReader, fontObject) {
    parseFontData(this, pdfReader, fontObject);
}

FontDecoding.prototype.translate = function (encodedBytes) {
    if (this.hasToUnicode) {
        return { result: toUnicodeEncoding(this.toUnicodeMap, encodedBytes), method: 'toUnicode' };
    } else {
        console.log(chalk.yellow('Font without toUnicode detected, these are not supported and could lead to undesired results for the text replacement'));
    }
};

FontDecoding.prototype.getBytesFromString = function (str) {
    const reversedUnicodeMap = flipToUnicodeMap(this.toUnicodeMap);

    /**
     * todo: this only works if the byte array has a length of one
     * will this cause issues for certain characters/fonts?
     * Should we use the beToNum and besToUnicodes functions here?
     */
    return [...str].map((char) => {
        const byteArray = stringToByteArray(char);
        return reversedUnicodeMap[byteArray[0]];
    });

    /**
     * { a: [1], b: [2] } => { 1: a, 2: b }
    * todo: this only works if the byte array has a length of one
     * will this cause issues for certain characters/fonts?
     * Should we use the beToNum and besToUnicodes functions here?
     */
    function flipToUnicodeMap(data) {
        const newMap = {};
        Object.keys(data).forEach((key) => {
            newMap[data[key][0]] = Number(key);
        });
        return newMap;
    }
};

module.exports = {
    FontDecoding,
};