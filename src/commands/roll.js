import api from '../api';
import names from '../names';

export default function(message, next) {
	let dMatch = message.text.match('^\/d([0-9]+)');
	if (dMatch !== null) message.text = '/roll ' + dMatch[1];

	let rollMatch = message.text.match(/^\/roll(?:\s+(.+))?/);
	if (rollMatch === null) return next();

	let rollNum = 100;
	if (rollMatch[1]) rollNum = parseInt(rollMatch[1], 10);
	if (isNaN(rollNum)) rollNum = 100;

	const result = Math.floor(Math.random() * rollNum) + 1;
	const name = names.get(message.from);

	api.sendMessage(message.chat.id, `${name}: ${result}`);
};
