import api from '../api';
import config from '../config';
import db from '../db';
import fs from 'fs';
import names from '../names';
import shutdown from '../shutdown';
import quoteUtils from '../quoteUtils';
import moment from 'moment';

let stats = db.get('stats');
setInterval(() => db.set('stats', stats), 60 * 1000);
shutdown.onExit(() => db.set('stats', stats));

function insert(index, ...items) {
	this.splice.apply(this, [index, 0].concat(items));
	return this;
}

function initStats(chatStats, userId) {
	chatStats[userId] = chatStats[userId] || {
		id: userId,
		messages: 0,
		letters: 0,
		quote: '',
		arrivalDate: moment.utc().format()
	};

	if (! chatStats[userId].arrivalDate) {
		chatStats[userId].arrivalDate = "2015-07-01T00:00:00.000Z";
	}
}

function parseStatsFromMessage(message, userStats) {
	if (message.text[0] === '/' || message.text[0] === '!' || message.text.match(/^\s*$/) !== null) return;

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

	const nameParts = userStats.name.split(/\s+/g);
	let nameLine;

	if (nameParts.length === 1) {
		// Batman: my throat hurts
		nameLine = `${userStats.name}: "${userStats.quote}"`;
	} else {
		// Bruce "my throat hurts" Wayne
		nameLine = nameParts.slice(0)::insert(1, `"${userStats.quote}"`).join(' ');
	}

	const lettersPerMessage = (userStats.letters / (userStats.messages || 1)).toFixed(2);

	const now = moment.utc();
	const messagesPerDay = (userStats.messages / (now.diff(moment(userStats.arrivalDate), 'days') || 1)).toFixed(2);

	const statMessage = `${nameLine}
${userStats.messages} messages since ${moment(userStats.arrivalDate).format('MMMM Do, YYYY')}
${lettersPerMessage} letters/msg avg, ${messagesPerDay} msg/day avg`;

	api.sendMessage(chatId, statMessage);
}

export default function(message, next) {
	const chatId = message.chat.id;
	if (! stats[chatId]) stats[chatId] = {};

	let chatStats = stats[chatId];
	const userId = message.from.id;

	// Init the user's stats if they don't exist yet
	initStats(chatStats, userId);
	let userStats = chatStats[userId];

	// Always update the user's name
	userStats.name = names.get(message.from);

	if (message.text === '/stats') {
		runStatsCommand(chatStats[userId], chatId);
		return;
	} else {
		parseStatsFromMessage(message, userStats);
	}

	next();
};
