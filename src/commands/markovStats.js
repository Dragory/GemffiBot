import api from '../api';
import cmd from '../cmd';
import markovRepo from '../markovRepo';

export default function(message, next) {
	if (! message.text) return next();

    let match = cmd.match(message.text, 'generate_stats');
	if (! match) return next();

	markovRepo.get(message.chat.id).then((table) => {
		let keys = Object.keys(table).length;
		let keysForKeys = Object.keys(table).reduce((total, key) => {
			return total + Object.keys(table[key]).length;
		}, 0);

		api.sendMessage(message.chat.id, `Stats for /generate:
Markov table keys: ${keys}
Markov table values for keys: ${keysForKeys}
Avg. values per key: ${(keysForKeys/keys).toFixed(2)}`);
	});
}
