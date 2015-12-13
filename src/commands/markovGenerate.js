import config from '../config';
import api from '../api';
import cmd from '../cmd';
import markov from '../markov';
import markovRepo from '../markovRepo';

const regularCharRegex = /[a-zäåöA-ZÄÅÖ]/;

let generateCD = cmd.createCD(60);
let generateLimiter = cmd.createLimiter(3, 60 * 60);

export default function(message, next) {
	if (! message.text) return next();

    let match = cmd.match(message.text, 'generate', cmd.MATCH_NUM, cmd.MATCH_REST)
        || cmd.match(message.text, 'generate', cmd.MATCH_NUM)
        || cmd.match(message.text, 'generate', cmd.MATCH_REST)
        || cmd.match(message.text, 'generate');

    if (! match) {
        let spammerMatch = cmd.match(message.text, 'olen homo ja spämmin');

        if (spammerMatch) {
            generateCD.reset(message.from.id);
            generateLimiter.reset(message.from.id);
            api.sendMessage(message.chat.id, `vittu mitä paskaa`);

            return next(true);
        }

        return next();
    }

    if (! cmd.checkAndInformLimits(message.from.id, generateCD, generateLimiter)) return next(true);

    // The user can supply a custom beginning for the generated text
    // This can either replace the length param or come after it, preferring the one after
    let start = null;
    if (match[1]) start = match[1];
    if (match[0] && isNaN(match[0])) start = match[0];

	// Always start with a new word after the start
	if (start) start = start.trim() + ' ';

    // We want the UI to expose the length in chars, but the internal implementation uses the number of markov table keys
    // Hence, we divide the given length by the markov key length and ceil that, but also want it always to be min 1 (otherwise we would generate empty strings)
    let userLength = (match[0] && ! isNaN(match[0]) ? Math.min(200, Math.max(1, parseInt(match[0], 10))) : 32);
    let length = Math.max(1, Math.ceil(userLength / config.markovCharLength));
	// See note on truncation below
	let lengthDiff = Math.max(0, (length * config.markovCharLength) - userLength);

    markovRepo.get(message.chat.id).then((table) => {
        if (! table) return next();

        let text = markov.generateText(table, length, start);

		// If the user requested e.g. 6 chars but we generated 8 (because of table key length), truncate the result to 6 here
		text = text.slice(0, text.length - lengthDiff);

        text = (text.slice(0, 1).toUpperCase() + text.slice(1)).replace(/\s+/, ' ').trim() + '.';

        api.sendMessage(message.chat.id, `${text} (length diff ${lengthDiff})`);
        next();
    });

    next(true);
}
