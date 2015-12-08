import api from '../api';
import names from '../names';
import cmd from '../cmd';

const eightBallReplies = [
	'Varmasti',
	'Totta kai',
	'Epäilemättä',
	'Ehdottomasti',
	'Luotettavasti',
	'Uskoisin näin',
	'Mitä luultavaimmin',
	'Todennäköisesti',
	'Kyllä',
	'Vaikuttaisi siltä että joo',
	'En löisi vetoa',
	'Ei',
	'Eij',
	'Luultavasti ei',
	'Hyvin epätodennäköistä'
];

export default function(message, next) {
	if (! message.text) return next();

	let match = cmd.match(message.text, '8ball', cmd.MATCH_REST);
	if (! match) return next();

	if (! cmd.checkAndInformLimits(message.from.id, cmd.globalCD, cmd.globalLimiter)) return next(true);

	const name = names.short(message.from);
	const reply = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)];

	api.sendMessage(message.chat.id, `${name}: ${reply}`);
	next(true);
};
