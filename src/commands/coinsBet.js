import api from '../api';
import names from '../names';
import cmd from '../cmd';

import coinsRepo from '../coinsRepo';

let coinsCD = cmd.createCD(5);
let coinsLimiter = cmd.createLimiter(5, 60 * 10);

export default function(message, next) {
	if (! message.text) return next();
	
	let match = cmd.match(message.text, 'bet', cmd.MATCH_NUM, 'for', cmd.MATCH_NUM);
	if (! match) return next();

	if (! cmd.checkAndInformLimits(message.from.id, coinsCD, coinsLimiter)) return next(true);

	const name = names.short(message.from);

	let [amount, , chance] = match;
	chance = parseInt(chance, 10);
	amount = parseInt(amount, 10);
	if (amount <= 0 || chance <= 1 || ! amount || ! chance || amount === Infinity) return next(true);
	if (chance > 100) {
		api.sendMessage(message.chat.id, `${name}: The maximum roll you can bet for is 100`);
		return;
	}

	coinsRepo.get(message.chat.id, message.from.id).then((coins) => {
		if (coins < amount) {
			api.sendMessage(message.chat.id, `${name}: You don't have ${amount} coins!`);
			return next(true);
		}

		coinsRepo.set(message.chat.id, message.from.id, coins - amount).then(() => {
			let toss = Math.floor(Math.random() * chance) + 1;

			if (toss === chance) {
				coinsRepo.set(message.chat.id, message.from.id, coins - amount + amount * chance).then(() => {
					api.sendMessage(message.chat.id, `${name}: ${toss} (DING DING DING)`);
					next(true);
				});
			} else {
				api.sendMessage(message.chat.id, `${name}: ${toss} (wah wah waa)`);
				next(true);
			}
		});
	});
};
