const links = /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,24}(\/\S*)?/gi;
const punctuation = /[.,\-_]/gi;
const whitespace = /\s+/gi;
const startsWithWhitespace = /^\s+/;

function createMarkovTable(sourceText, charLength = 1) {
    let table = {};

    sourceText = sourceText
        .replace(links, '')
        .replace(punctuation, '')
        .replace(whitespace, ' ')
        .toLowerCase();

    for (let i = 0; i < (sourceText.length - charLength); i++) {
        let char = sourceText.slice(i, i + charLength),
            prev = (i >= charLength ? sourceText.slice(i - charLength, i) : null);

        if (startsWithWhitespace.test(char)) continue;

        table[char] = table[char] || {};

        // Add weight to this char following the previous one
        if (prev && table[prev]) table[prev][char] = (table[prev][char] || 0) + 1;
    }

    return table;
}

function generateText(table, length) {
    let text = '',
        prev = null;

    for (let i = 0; i < length; i++) {
        if (prev && table[prev] && Object.keys(table[prev]).length) {
            prev = weightedRandom(table[prev]);
        } else {
            prev = randomKey(table);
        }

        text += prev;
    }

    return text;
}

function randomKey(obj) {
    let keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
}

function weightedRandom(candidates) {
    let total = Object.keys(candidates).reduce((total, key) => total + candidates[key], 0),
        rand = Math.floor(Math.random() * total);

    for (let key in candidates) {
        if (rand < candidates[key]) return key;
        rand -= candidates[key];
    }

    return null;
}

export default {
    createMarkovTable,
    generateText
};
