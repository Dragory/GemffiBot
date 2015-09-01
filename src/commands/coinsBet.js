import api from '../api';
import names from '../names';
import cmdMatcher from '../cmdMatcher';

import coinsRepo from '../coinsRepo';

// Limit gambling addiction
let userBets = {};
setInterval(function() {
	// Reset userBets every minute
	userBets = {};
}, 60000);

export default function(message, next) {
	let cmdMatch = cmdMatcher.match(message.text, 'bet', cmdMatcher.MATCH_NUM, 'for', cmdMatcher.MATCH_NUM);
	if (! cmdMatch) return next();

	const name = names.short(message.from);

	let [amount, , chance] = cmdMatch;
	chance = parseInt(chance, 10);
	amount = parseInt(amount, 10);
	if (amount <= 0 || chance <= 1 || ! amount || ! chance || amount === Infinity) return next();
	if (chance > 100) {
		api.sendMessage(message.chat.id, `${name}: The maximum roll you can bet for is 100`);
		return;
	}

	userBets[message.from.id] = userBets[message.from.id] || 0;
	userBets[message.from.id]++;

	if (userBets[message.from.id] === 3) {
		api.sendMessage(message.chat.id, `${name}: Beep boop you have reached your gambling limit you addicted fuck. Please do (not) try again later.`);
		return;
	}

	coinsRepo.get(message.chat.id, message.from.id).then((coins) => {
		if (coins < amount) {
			api.sendMessage(message.chat.id, `${name}: You don't have ${amount} coins!`);
			return;
		}

		coinsRepo.set(message.chat.id, message.from.id, coins - amount).then(() => {
			let toss = Math.floor(Math.random() * chance) + 1;

			if (toss === chance) {
				coinsRepo.set(message.chat.id, message.from.id, coins - amount + amount * chance).then(() => {
					api.sendMessage(message.chat.id, `${name}: ${toss} (DING DING DING)`);
				});
			} else {
				api.sendMessage(message.chat.id, `${name}: ${toss} (wah wah waa)`);
			}
		});
	});
};
