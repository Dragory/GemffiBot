import api from '../api';
import names from '../names';
import me from '../me';

export default function(message, next) {
	let idMatch = message.text.match('^\/id(?:@${me.username})?$');
	let cidMatch = message.text.match('^\/cid(?:@${me.username})?$');

	if (idMatch === null && cidMatch === null) return next();

	if (idMatch) api.sendMessage(message.chat.id, `${names.short(message.from)}: ${message.from.id}`);
	if (cidMatch) api.sendMessage(message.chat.id, `${names.short(message.from)}: ${message.chat.id}`);

	return next(true);
};
