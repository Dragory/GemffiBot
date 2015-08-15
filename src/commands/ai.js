import api from '../api';
import names from '../names';
import config from '../config';
import me from '../me';

import cleverbot from 'cleverbot.io';

let botSession = null;
let bot = new cleverbot(config.cleverbotIoUser, config.cleverbotIoKey);
bot.setNick('gemffi');
bot.create((err, session) => {
	if (err) {
		console.log('bot.create:', err);
		return;
	}

	botSession = session;
});

export default function(message, next) {
	if (botSession == null) return next();

	const commandMatch = message.text.match(new RegExp(`^\\/ai(?:@${me.username})?\\s+(.+)`));
	console.log('ai match', commandMatch);
	if (commandMatch === null) return next();

	const input = commandMatch[1];
	const name = names.short(message.from);

	console.log('ai input', input);

	bot.ask(input, (err, response) => {
		console.log('bot ask response', response);
		if (err) { console.log('bot.ask:', err, response); return; }
		api.sendMessage(message.chat.id, `${name}: ${response}`);
	});
};
