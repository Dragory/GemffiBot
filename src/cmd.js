import me from './me';
import api from './api';

const MATCH_ANY = `(?:".*?")|(?:[^\\s]+)`;
const MATCH_NUM = `\\-?[1-9][0-9]*`;
const MATCH_REST = `.*`;

function match(str, cmd, ...params) {
	// The command itself
	let regexStr = `^\\/${cmd}(?:@${me.username})?`;

	// Specified params
	params.forEach((str) => {
		regexStr += `\\s+(${str})`;
	});

	regexStr += '$';

	let regex = new RegExp(regexStr);
	let match = str.match(regex);

	if (! match) return null;
	return match.slice(1);
}

function createCD(secs) {
	var onCD = {};

	return {
		trigger: (id) => {
			onCD[id] = (new Date()).getTime() + (secs * 1000);
		},

		isOnCD: (id) => {
			return onCD[id] && ((new Date()).getTime() < (onCD[id] || 0));
		},

		error: (id) => {
			let remaining = ((onCD[id] || 0) - (new Date()).getTime()) / 1000;
			remaining = Math.round(remaining * 100) / 100;
			return `Command on cooldown (${remaining} seconds left)`;
		}
	};
}

function createLimiter(maxCalls, inSecs) {
	var calls = {};

	setInterval(() => {
		calls = {};
	}, inSecs * 1000);

	return {
		trigger: (id) => {
			calls[id] = calls[id] || 0;
			calls[id]++;
		},

		isLocked: (id) => {
			return ((calls[id] || 0) >= maxCalls);
		},

		error: (id) => {
			return `Command is throttled (max ${maxCalls} uses allowed in ${inSecs} seconds)`;
		}
	};
}

function checkAndInformLimits(id, cd, limiter) {
	if (cd.isOnCD(id)) {
		api.sendMessage(id, cd.error(id));
		return false;
	}

	if (limiter.isLocked(id)) {
		api.sendMessage(id, limiter.error(id));
		return false;
	}

	cd.trigger(id);
	limiter.trigger(id);

	return true;
}

/**
 * Returns a function that runs the given update through the given commands.
 * Calls cb() once finished.
 * @param  {Array}    commands Commands to run
 * @param  {Function} cb       Function to call after finishing with this update
 */
function createUpdateHandler(commands, cb) {
	let timeout, done = () => {
		clearTimeout(timeout);
		cb();
	};

	return function(update) {
		let i = -1;

		function callNext(last) {
			i++;
			if (last) return done();

			let command = commands[i];
			if (! command) return done();

			command.cmd(update.message, callNext);
		}

		timeout = setTimeout(done, 10000); // 10 sec timeout if commands get stuck or throw errors
		callNext();
	};
}

let globalCD = createCD(2);
let globalLimiter = createLimiter(15, 60 * 15);

export default {
	match,
	MATCH_ANY,
	MATCH_NUM,
	MATCH_REST,

	createCD,
	createLimiter,
	checkAndInformLimits,
	globalCD,
	globalLimiter,

	createUpdateHandler
};
