import api from '../api';
import names from '../names';
import config from '../config';
import cmd from '../cmd';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	let match = cmd.match(message.text, 'top');
	if (! match) return next();

	if (! cmd.checkAndInformLimits(message.from.id, cmd.globalCD, cmd.globalLimiter)) return;

	coinsRepo.all(message.chat.id).then((records) => {
		records.sort((a, b) => (a.coins > b.coins ? -1 : 1));

		let resultMessage = records.slice(0, 5).map((row, i) => {
			return `${i + 1}. ${names.short(row)} (${row.coins} coins)`;
		}).join('\n');

		api.sendMessage(message.chat.id, resultMessage);
	});
};
