function MultiDictHelper(dicts) {
    this.dicts = dicts;
}

MultiDictHelper.prototype.exists = function (name) {
    return !!this.dicts.find((dict) => dict.exists(name));
};

MultiDictHelper.prototype.queryDictionaryObject = function (name, pdfReader) {
    const dict = this.dicts.find((dict) => {
        return dict.exists(name);
    });

    if (dict) {
        return pdfReader.queryDictionaryObject(dict, name);
    }
    return null;
};

module.exports = {
    MultiDictHelper,
};
