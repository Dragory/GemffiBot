import api from '../api';
import stats from '../../stats.json';
import fs from 'fs';
import names from '../names';
import quoteUtils from '../quoteUtils';

setInterval(function() {
	fs.writeFile(__dirname + '/../../stats.json', JSON.stringify(stats, null, 4));
}, 60 * 1000);

function insert(index, ...items) {
	this.splice.apply(this, [index, 0].concat(items));
	return this;
}

function parseStatsFromMessage(message, chatStats) {
	if (message.text[0] === '/' || message.text.match(/^\s*$/) !== null) return;

	const userId = message.from.id;

	// Init the user's stats if they don't exist yet
	let userStats = chatStats[userId] = chatStats[userId] || {
		id: userId,
		messages: 0,
		letters: 0,
		quote: ''
	};

	// Update the user's name
	userStats.name = names.get(message.from);

	// Update the stats
	userStats.messages++;
	userStats.letters += (message.text.match(/[^\s]/g) || []).join('').length;

	// Update the quote using a MEGA ALGORITHM BY RAZORIH
	if (Math.random() < quoteUtils.getTextInterestingnessValue(message.text) || userStats.quote === '') {
		userStats.quote = message.text;
	}
}

function runStatsCommand(userStats, chatId) {
	if (userStats == null) return;

	const lettersPerMessage = (userStats.letters / userStats.messages).toFixed(2); // Messages can't be 0 because we immediately add one to it above when we create the object
	const nameParts = userStats.name.split(/\s+/g);
	let nameLine;

	if (nameParts.length === 1) {
		// Batman: my throat hurts
		nameLine = `${userStats.name}: "${userStats.quote}"`;
	} else {
		// Bruce "my throat hurts" Wayne
		nameLine = nameParts.slice(0)::insert(1, `"${userStats.quote}"`).join(' ');
	}

	const statMessage = `${nameLine}
${userStats.messages} messages, ${lettersPerMessage} letters/message avg`;

	api.sendMessage(chatId, statMessage);
}

export default function(message, next) {
	const chatId = message.chat.id;
	if (! stats[chatId]) stats[chatId] = {};

	let chatStats = stats[chatId];
	const userId = message.from.id;

	if (message.text === '/stats') {
		runStatsCommand(chatStats[userId], chatId);
		return;
	} else {
		parseStatsFromMessage(message, chatStats);
	}

	next();
};
