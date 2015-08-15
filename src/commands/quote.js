import moment from 'moment';
import api from '../api';
import names from '../names';
import config from '../config';
import db from '../db';
import shutdown from '../shutdown';
import me from '../me';

export default function() {};

let quotes = db.get('quotes');
setInterval(() => db.set('quotes', quotes), 60 * 1000);
shutdown.onExit(() => db.set('quotes', quotes));

function handleSetQuote(chatQuotes, quoteName, text, message) {
	const name = names.short(message.from);

	if (config.quoteBanned.indexOf(message.from.id) !== -1) {
		api.sendMessage(message.chat.id, `${name}: ur banned from using quotes u fok`);
		return;
	}

	if (chatQuotes[quoteName] && chatQuotes[quoteName].userId !== message.from.id && config.admins.indexOf(message.from.id) === -1) {
		api.sendMessage(message.chat.id, `${name}: sorry, you can't change someone else's quote`);
		return;
	}

	if (text == null) {
		delete chatQuotes[quoteName];
		api.sendMessage(message.chat.id, `${name}: quote ${quoteName} removed`);
		return;
	}

	text = text.replace(/(^|\s)@/g, '$1'); // Strip highlights; thanks Kytö
	text = text.replace(/\n|\r/, ' '); // Strip newlines; thanks Jake

	if (text.length > 80) {
		api.sendMessage(message.chat.id, `${name}: quote too long`);
		return;
	}

	chatQuotes[quoteName] = {
		userId: message.from.id,
		name: name,
		date: moment.utc().format(),
		quote: text
	};

	api.sendMessage(message.chat.id, `${name}: quote ${quoteName} set`);
}

export default function(message, next) {
	let chatQuotes = quotes[message.chat.id] = quotes[message.chat.id] || {};

	const match = message.text.match(new RegExp(`/^\\/q(?:@${me.username})?\\s+(\\".*?\\"|[^\\s]+)(?:\\s+(.+))?$/`));
	if (match !== null) {
		let [_, quoteName, text] = match;

		if (quoteName[0] === '"' && quoteName[quoteName.length - 1] == '"') {
			quoteName = quoteName.slice(1, -1);
		}

		handleSetQuote(chatQuotes, quoteName, text, message);
		return;
	}

	if (message.text[0] !== '!') return next();
	let quoteName = message.text.slice(1);

	if (! chatQuotes[quoteName]) return next();

	// If the quote is found but originates from a quote banned user, remove the quote
	if (config.quoteBanned.indexOf(chatQuotes[quoteName].userId) !== -1) {
		delete chatQuotes[quoteName];
		return next();
	}

	api.sendMessage(message.chat.id, `${chatQuotes[quoteName].quote}`);
	// Set by ${quotes[quoteName].name} on ${moment(quotes[quoteName].date).format('MMMM Do, YYYY')}
};
