import api from '../api';
import names from '../names';
import {match} from '../cmdMatcher';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	let cmdMatch = match(message.text, 'coins');
	if (! cmdMatch || cmdMatch._rest != null) return next();

	const name = names.short(message.from);

	coinsRepo.get(message.chat.id, message.from.id).then((coins) => {
		api.sendMessage(message.chat.id, `${name}: ${coins} coins`);
	});
};
