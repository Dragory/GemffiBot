import api from '../api';
import names from '../names';
import config from '../config';
import cmdMatcher from '../cmdMatcher';

import coinsRepo from '../coinsRepo';

export default function(message, next) {
	let cmdMatch = cmdMatcher.match(message.text, 'top');
	if (! cmdMatch) return next();

	coinsRepo.all(message.chat.id).then((records) => {
		records.sort((a, b) => (a.coins > b.coins ? -1 : 1));

		let resultMessage = records.slice(0, 5).map((row, i) => {
			return `${i + 1}. ${names.short(row)} (${row.coins} coins)`;
		}).join('\n');

		api.sendMessage(message.chat.id, resultMessage);
	});
};
