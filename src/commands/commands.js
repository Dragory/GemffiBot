import api from '../api';
import cmdMatcher from '../cmdMatcher';

export default function(message, next) {
	let cmdMatch = cmdMatcher.match(message.text, 'commands');
	if (! cmdMatch) return next();

	api.sendMessage(message.chat.id,
`Commands:
/roll <number> - rolls a dice
/d<number> - same as above, shorthand (e.g. /d123)
/stats - prints your chat stats
/coins - shows your coins
/bet <amount> for <roll> - lets you bet your coins (return multiplier is same as roll chance)
/top - shows a coin leaderboard
/8ball - answers yes/no questions
/id - prints your user id
/cid - prints the chat's id
/oi <text> - OI M8
/ai <text> - chatbot`);
};
