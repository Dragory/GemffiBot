import api from '../api';
import me from '../me';

export default function(message, next) {
	if (! message.text) return next();
	
	let idMatch = message.text.match(/^\/oi(?:@${me.username})?\s+((?:.|\s)+)$/m);
	if (idMatch === null) return next();

	let text = idMatch[1].replace(/i/ig, 'oi').replace(/y/ig, 'oy').replace(/[au]/ig, 'o').toUpperCase();

	api.sendMessage(message.chat.id, text);
	next(true);
};
