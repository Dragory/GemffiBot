import moment from 'moment';
import api from '../api';
import names from '../names';
import db from '../db';
import shutdown from '../shutdown';

export default function() {};

let quotes = db.get('quotes');
setInterval(() => db.set('quotes', quotes), 60 * 1000);
shutdown.onExit(() => db.set('quotes', quotes));

/*

// Asking for an old quote
if (text == null) {
	if (quotes[quoteName]) {
		api.sendMessage(message.chat.id, `${quotes[quoteName].quote}
Set by ${quotes[quoteName].name} on ${moment(quotes[quoteName].date).format('MMMM Do, YYYY')}`);
	}

	return next();
}

 */

function handleSetQuote(quoteName, text, message) {
	const name = names.short(message.from);

	if (quotes[quoteName] && quotes[quoteName].userId !== message.from.id) {
		api.sendMessage(message.chat.id, `${name}: sorry, you can't change someone else's quote`);
		return;
	}

	quotes[quoteName] = {
		userId: message.from.id,
		name: name,
		date: moment.utc().format(),
		quote: text
	};

	api.sendMessage(message.chat.id, `${name}: quote ${quoteName} set`);
}

export default function(message, next) {
	const match = message.text.match(/^\/q\s+([^\s]+?)\s+(.+)/);
	if (match !== null) {
		let [_, quoteName, text] = match;
		handleSetQuote(quoteName, text, message);
		return next();
	}

	const readMatch = message.text.match(/^\/([^\s]+)/);
	if (readMatch === null) return next();

	let quoteName = readMatch[1];
	if (! quotes[quoteName]) return next();

	api.sendMessage(message.chat.id, `${quotes[quoteName].quote}`);
	// Set by ${quotes[quoteName].name} on ${moment(quotes[quoteName].date).format('MMMM Do, YYYY')}
};
