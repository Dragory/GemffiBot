const links = /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,24}(\/\S*)?/gi;
const punctuation = /[.,\-_]/gi;
const whitespace = /\s+/gi;
const startsWithWhitespace = /^\s+/;
const onlyWhitespace = /^\s+$/;

function cleanSourceText(sourceText) {
    return sourceText
        .replace(links, '')
        .replace(whitespace, ' ')
        .toLowerCase();
}

function cloneObject(obj) {
    let clone = {};

    for (let key in obj) {
        if (typeof obj[key] === 'object') clone[key] = cloneObject(obj[key]);
        clone[key] = obj[key];
    }

    return clone;
}

function createMarkovTable(sourceText, charLength = 1) {
    let table = {};

    sourceText = cleanSourceText(sourceText);
    if (sourceText.length < charLength) return table;

    for (let i = 0; i < (sourceText.length - charLength); i++) {
        let char = sourceText.slice(i, i + charLength),
            prev = (i >= charLength ? sourceText.slice(i - charLength, i) : null);

        table[char] = table[char] || {};

        if (onlyWhitespace.test(char)) continue;

        // Add weight to this char following the previous one
        if (prev && table[prev]) table[prev][char] = (table[prev][char] || 0) + 1;
    }

    return table;
}

let genStats = {

};

function getGenStats() {
    return genStats;
}

function generateText(table, length, start = null) {
    let fullGenStart = (new Date()).getTime();

    let maxKeyLengthFindStart = (new Date()).getTime();

    let text = '',
        maxKeyLength = Object.keys(table).reduce((max, key) => Math.max(max, key.length), 0),
        prev = null;

    genStats.maxKeyLengthFind = (new Date()).getTime() - maxKeyLengthFindStart;

    let cleanStart = (new Date()).getTime();
    start = (start ? cleanSourceText(start) : null);
    genStats.clean = (new Date()).getTime() - cleanStart;

    // If the start is specified, try to find the longest existing key from its end we can continue from
    if (start) {
        text = start;

        let longestStart = (new Date()).getTime();
        for (let i = maxKeyLength; i > 1; i--) {
            let candPrev = start.slice(-1 * i);
            if (table[candPrev] && Object.keys(table[candPrev]).length) {
                prev = candPrev;
                break;
            }
        }
        genStats.longestFind = (new Date()).getTime() - longestStart;

        // If we can't continue from the start, add a space so we don't just mash two words together
        if (! prev) text += ' ';
    }

    let genStart = (new Date()).getTime();
    for (let i = 0; i < length; i++) {
        if (prev && table[prev] && Object.keys(table[prev]).length) {
            prev = weightedRandom(table[prev], 2);
        } else {
            prev = randomKey(table);
        }

        text += prev;
    }
    genStats.gen = (new Date()).getTime() - genStart;

    genStats.full = (new Date()).getTime() - fullGenStart;
    return text;
}

function randomKey(obj) {
    let keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
}

function weightedRandom(candidates, weightExp) {
    candidates = cloneObject(candidates);

    if (weightExp) {
        Object.keys(candidates).forEach((key) => {
            candidates[key] = Math.pow(candidates[key], weightExp);
        });
    }

    let total = Object.keys(candidates).reduce((total, key) => total + candidates[key], 0);

    let rand = Math.floor(Math.random() * total);

    for (let key in candidates) {
        if (rand <= candidates[key]) return key;
        rand -= candidates[key];
    }

    return '[[ _ EI _ ]]';
}

export default {
    createMarkovTable,
    generateText,
    getGenStats
};
