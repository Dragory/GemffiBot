import me from './me';

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

export default {
	match,
	MATCH_ANY,
	MATCH_NUM
};
