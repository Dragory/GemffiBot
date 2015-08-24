import moment from 'moment';
import api from '../api';
import names from '../names';
import config from '../config';
import me from '../me';
import quoteRepo from '../quoteRepo';

function handleSetQuote(chatId, trigger, text, message) {
	const name = names.short(message.from);

	if (config.quoteBanned.indexOf(message.from.id) !== -1) {
		api.sendMessage(message.chat.id, `${name}: ur banned from using quotes u fok`);
		return;
	}

	quoteRepo.get(chatId, trigger).then((quote) => {
		// Replacing old quotes
		if (quote && parseInt(quote.user_id, 10) !== message.from.id && config.admins.indexOf(message.from.id) === -1) {
			api.sendMessage(message.chat.id, `${name}: sorry, you can't change someone else's quote`);
			return;
		}

		// Removing old quotes (the check above checks user rights for this too)
		if (quote && text == null) {
			quoteRepo.del(chatId, trigger).then(() => {
				api.sendMessage(message.chat.id, `${name}: quote ${trigger} removed`);
			});

			return;
		}

		// Setting a new quote
		text = text.replace(/(^|\s)@/g, '$1'); // Strip highlights; thanks Kytö
		text = text.replace(/\n|\r/, ' '); // Strip newlines; thanks Jake

		if (text.length > 140) {
			api.sendMessage(message.chat.id, `${name}: quote too long (hint: twitter)`);
			return;
		}

		if (quote) {
			quoteRepo.update(chatId, trigger, {
				user_id: message.from.id,
				quote: text,
				date: (new Date()).toISOString()
			}).then(() => {
				api.sendMessage(message.chat.id, `${name}: quote ${trigger} updated`);
			});
		} else {
			quoteRepo.create({
				chat_id: chatId,
				trigger: trigger,
				user_id: message.from.id,
				quote: text,
				date: (new Date()).toISOString()
			}).then(() => {
				api.sendMessage(message.chat.id, `${name}: quote ${trigger} created`);
			});
		}
	});
}

export default function(message, next) {
	const match = message.text.match(new RegExp(`^\\/q(?:@${me.username})?\\s+(\\".*?\\"|[^\\s]+)(?:\\s+(.+))?$`));

	if (match !== null) {
		let [_, trigger, text] = match;

		if (trigger[0] === '"' && trigger[trigger.length - 1] == '"') {
			trigger = trigger.slice(1, -1);
		}

		handleSetQuote(message.chat.id, trigger, text, message);
		return;
	}

	if (message.text[0] !== '!') return next();
	let trigger = message.text.slice(1);

	quoteRepo.get(message.chat.id, trigger).then((quote) => {
		if (quote == null) return next();
		if (config.quoteBanned.indexOf(quote.user_id) !== -1) return next();

		api.sendMessage(message.chat.id, `${quote.quote}`);
	});
};
