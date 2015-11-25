import config from '../config';
import api from '../api';
import cmd from '../cmd';
import markov from '../markov';
import markovRepo from '../markovRepo';

export default function(message, next) {
    let match = cmd.match(message.text, 'generate', cmd.MATCH_REST) || cmd.match(message.text, 'generate');
    if (! match) return next();

    // We want the UI to expose the length in chars, but the internal implementation uses the number of markov table keys
    // Hence, we divide the given length by the markov key length and ceil that, but also want it always to be min 1 (otherwise we would generate empty strings)
    let userLength = (match[0] && ! isNaN(match[0]) ? Math.min(200, Math.max(1, parseInt(match[0], 10))) : 32);
    let length = Math.max(1, Math.ceil(userLength / config.markovCharLength));

    markovRepo.get(message.chat.id).then((table) => {
        if (! table) return next();
        let text = markov.generateText(table, length);
        text = (text.slice(0, 1).toUpperCase() + text.slice(1)).trim() + '.';

        api.sendMessage(message.chat.id, `${text}`);
        next();
    });

    next(true);
};
