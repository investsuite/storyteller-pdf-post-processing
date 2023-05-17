class MultiDictHelper {
    constructor(dicts) {
        this.dicts = dicts;
    }

    exists(name) {
        return !!this.dicts.find((dict) => dict.exists(name));
    };

    queryDictionaryObject(name, pdfReader) {
        const dict = this.dicts.find((dict) => {
            return dict.exists(name);
        });

        if (dict) {
            return pdfReader.queryDictionaryObject(dict, name);
        }
        return null;
    };
}

module.exports = {
    MultiDictHelper,
};
