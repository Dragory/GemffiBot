import api from '../api';
import names from '../names';
import me from '../me';

export default function(message, next) {
	let idMatch = message.text.match('^\/id(?:@${me.username})?$');
	if (idMatch === null) return next();

	api.sendMessage(message.chat.id, `${names.short(message.from)}: ${message.from.id}`);
};
