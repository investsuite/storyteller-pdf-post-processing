function byteArrayToHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2).toUpperCase();
    }).join('');
}

function hexStringToByteArray(hexString) {
    let bytes = [];
    for (let c = 0; c < hexString.length; c += 2)
        bytes.push(parseInt(hexString.substr(c, 2), 16));
    return bytes;
}

function stringToByteArray(str) {
    let myBuffer = [];
    let buffer = Buffer.from(str);
    for (let i = 0; i < buffer.length; i++) {
        myBuffer.push(buffer[i]);
    }
    return myBuffer;
}

module.exports = {
    byteArrayToHexString,
    hexStringToByteArray,
    stringToByteArray,
};