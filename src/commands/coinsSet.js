import api from '../api';
import names from '../names';
import config from '../config';
import cmd from '../cmd';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	// Admin only
	if (config.admins.indexOf(message.from.id) === -1) return next();

	let match = cmd.match(message.text, 'coins', 'set', cmd.MATCH_NUM, cmd.MATCH_NUM);
	if (! match) return next();

	if (! cmd.checkAndInformLimits(message.from.id, cmd.globalCD, cmd.globalLimiter)) return next(true);

	const name = names.short(message.from);

	let [_, userId, amount] = match;

	coinsRepo.set(message.chat.id, userId, amount).then(() => {
		api.sendMessage(message.chat.id, `${name}: Done`);
		next(true);
	});
};
