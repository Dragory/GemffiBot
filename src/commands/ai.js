import api from '../api';
import cmd from '../cmd';
import names from '../names';
import config from '../config';
import he from 'he';

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

	let match = cmd.match(message.text, 'ai', cmd.MATCH_REST);
	if (! match) return next();

	if (! cmd.checkAndInformLimits(message.from.id, cmd.globalCD, cmd.globalLimiter)) return;

	const input = match[1];
	const name = names.short(message.from);

	bot.ask(input, (err, response) => {
		if (err) { console.log('bot.ask:', err, response); return; }
		// Unicode chars are returned as |0000 (with the char's hex) so we
		// replace that with the equivalent HTML unicode entity.
		// The response may also include other HTML entities by default, such as
		// &auml; for ä. Decoding the whole message as HTML allows us to convert
		// these back to real characters.
		let text = he.decode(response.replace(/\|([0-9A-F]{4})/g, '&#x$1'));
		api.sendMessage(message.chat.id, `${name}: ${text}`);
	});
};
