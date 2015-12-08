import config from '../config';
import markov from '../markov';
import markovRepo from '../markovRepo';

const MARKOV_CHAR_LENGTH = 4;

export default function(message, next) {
	if (! message.text) return next();
	
    if (message.text.startsWith('/') || message.text.startsWith('!')) return next();

    let newTable = markov.createMarkovTable(message.text, config.markovCharLength);

    markovRepo.get(message.chat.id).then((table) => {
        if (table) {
            let combinedTable = JSON.parse(JSON.stringify(table));

            for (let key in newTable) {
                if (! combinedTable[key]) combinedTable[key] = {};
                for (let subKey in newTable[key]) {
                    if (combinedTable[key][subKey]) {
                        combinedTable[key][subKey] = combinedTable[key][subKey] + newTable[key][subKey]
                    } else {
                        combinedTable[key][subKey] = newTable[key][subKey];
                    }
                }
            }

            markovRepo.update(message.chat.id, combinedTable).then(next);
        } else {
            console.log('creating new markov table with', newTable);
            markovRepo.create(message.chat.id, newTable).then(next);
        }
    });
};
