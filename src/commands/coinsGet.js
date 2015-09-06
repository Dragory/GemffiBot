import api from '../api';
import names from '../names';
import cmd from '../cmd';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	let match = cmd.match(message.text, 'coins');
	if (! match) return next();

	const name = names.short(message.from);

	coinsRepo.get(message.chat.id, message.from.id).then((coins) => {
		api.sendMessage(message.chat.id, `${name}: ${coins} coins`);
		next(true);
	});
};
