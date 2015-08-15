import api from '../api';
import names from '../names';
import me from '../me';

export default function(message, next) {
	let dMatch = message.text.match('^\/d([0-9]+)');
	if (dMatch !== null) message.text = '/roll ' + dMatch[1];

	let rollMatch = message.text.match(new RegExp(`/^\/roll(?:@${me.username})?(?:\s+(.+))?/`));
	if (rollMatch === null) return next();

	let rollNum = 100;
	if (rollMatch[1]) rollNum = parseInt(rollMatch[1], 10);
	if (isNaN(rollNum)) rollNum = 100;

	const name = names.short(message.from);
	let result;

	if (rollNum === 0) {
		result = `ei nollasivusta noppaa oo olemassa vitun tyhmä`;
	} else {
		result = Math.floor(Math.random() * rollNum) + 1;
	}

	if (result === 420) {
		result = result.toString() + ' 🍁';
	}

	api.sendMessage(message.chat.id, `${name}: ${result}`);
};
