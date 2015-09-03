import api from '../api';
import config from '../config';
import fs from 'fs';
import names from '../names';
import quoteUtils from '../quoteUtils';
import moment from 'moment';
import me from '../me';
import cmd from '../cmd';
import statsRepo from '../statsRepo';

import {insert} from '../util';

const defaultStats = {
	id: 0,
	messages: 0,
	letters: 0,
	quote: '',
	arrivalDate: moment.utc().format()
};

/**
 * Adds default stat values to the given object if they are missing
 * @param  {object|null} stats Stats to add default values to;
 *                             Leave empty to return only defaults.
 * @return {object}            Input stats with default values added
 */
let initStats = Object.assign.bind(Object, {}, defaultStats);

/**
 * Updates the input stats with the stats from the input message.
 * @param  {string}  message   Message to parse
 * @param  {objects} stats     Stats to update
 * @return {void}
 */
function parseStatsFromMessage(message, stats) {
	if (message.text[0] === '/' || message.text[0] === '!' || message.text.match(/^\s*$/) !== null) return;

	// Update the stats
	stats.messages++;
	stats.letters += (message.text.match(/[^\s]/g) || []).join('').length;

	// Update the quote using a MEGA ALGORITHM BY RAZORIH
	if (Math.random() < quoteUtils.getTextInterestingnessValue(message.text) || stats.quote === '') {
		stats.quote = message.text;
	}
}

/**
 * Process /stats
 * @param  {object} userStats Stats to output
 * @param  {int} chatId    ID of the chat
 * @return {void}
 */
function getStatSummary(stats) {
	if (stats == null) return;

	const nameParts = stats.name.split(/\s+/g);
	let nameLine;

	if (nameParts.length === 1) {
		// Batman: my throat hurts
		nameLine = `${stats.name}: "${stats.quote}"`;
	} else {
		// Bruce "my throat hurts" Wayne
		nameLine = nameParts.slice(0)::insert(1, `"${stats.quote}"`).join(' ');
	}

	const lettersPerMessage = (stats.letters / (stats.messages || 1)).toFixed(2);

	const now = moment.utc();
	const messagesPerDay = (stats.messages / (now.diff(moment(stats.arrivalDate), 'days') || 1)).toFixed(2);

	const statMessage = `${nameLine}
${stats.messages} messages since ${moment(stats.arrivalDate).format('MMMM Do, YYYY')}
${lettersPerMessage} letters/msg avg, ${messagesPerDay} msg/day avg`;

	return statMessage;
}

/**
 * Main command handler
 * @param  {object}   message Message to handle
 * @param  {Function} next    Next function if we proceed
 * @return {void}
 */
export default function(message, next) {
	const CHAT_ID = message.chat.id;
	const USER_ID = message.from.id;

	statsRepo.get(CHAT_ID, USER_ID).then((stats) => {
		stats = initStats(stats || {});

		stats.name = names.get(message.from);

		let setStatsMatch = message.text.match(/^\/stats\s+set\s+([0-9]+)\s+(.+)$/);

		if (setStatsMatch && config.admins.indexOf(USER_ID) !== -1) {
			// SET STATS
			let [_, targetId, statJson] = setStatsMatch;
			let newStats;

			try { newStats = JSON.parse(statJson); } catch (e) {
				api.sendMessage(CHAT_ID, `Invalid JSON:\n${statJson}`);
				return;
			}

			statsRepo.get(CHAT_ID, targetId).then((targetStats) => {
				targetStats = initStats(targetStats || {});

				console.log(targetStats);
				Object.assign(targetStats, newStats);
				console.log(targetId, newStats, targetStats);
				return statsRepo.set(CHAT_ID, targetId, targetStats);
			}).then(api.sendMessage.bind(api, CHAT_ID, `Done.`));

			return;
		} else if (message.text === '/stats reset' || message.text === '/stats@' + me.username + ' reset') {
			// RESET STATS
			statsRepo.set(CHAT_ID, USER_ID, {}).then(() => {
				api.sendMessage(CHAT_ID, `${names.short(message.from)}: your stats have been reset`);
			});

			return;
		} else if (message.text === '/stats' || message.text === '/stats@' + me.username) {
			// OUTPUT STATS
			if (! cmd.checkAndInformLimits(message.from.id, cmd.globalCD, cmd.globalLimiter)) return;

			let output = getStatSummary(stats);
			api.sendMessage(CHAT_ID, output);

			return;
		} else if (message.text === '/stats old' || message.text === `/stats@${me.username} old`) {
			try {
				let oldStats = require('fs').readFileSync(__dirname + '/../../stats.json', {encoding: 'utf8'});
				oldStats = JSON.parse(oldStats || {});
				let chatStats = oldStats[CHAT_ID];
				if (! chatStats) throw new Error('Chat stats not found');
				let userStats = chatStats[USER_ID];
				if (! userStats) throw new Error('User stats not found');

				api.sendMessage(CHAT_ID, `${names.short(message.from)}: ${JSON.stringify(userStats)}`);
			} catch (e) {
				api.sendMessage(CHAT_ID, `${names.short(message.from)}: Could not fetch old stats: ${e}`);
			}

			return;
		} else {
			// PARSE STATS
			parseStatsFromMessage(message, stats);
			statsRepo.set(CHAT_ID, USER_ID, stats).then(next.bind(null, false));
		}
	});
};
