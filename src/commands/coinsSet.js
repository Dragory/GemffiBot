import api from '../api';
import names from '../names';
import config from '../config';
import cmdMatcher from '../cmdMatcher';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	// Admin only
	if (config.admins.indexOf(message.from.id) === -1) return next();

	let cmdMatch = cmdMatcher.match(message.text, 'coins', 'set', cmdMatcher.MATCH_NUM, cmdMatcher.MATCH_NUM);
	if (! cmdMatch) return next();

	const name = names.short(message.from);

	let [_, userId, amount] = cmdMatch;

	coinsRepo.set(message.chat.id, userId, amount).then(() => {
		api.sendMessage(message.chat.id, `${name}: Done`);
	});
};
