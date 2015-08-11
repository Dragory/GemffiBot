import api from '../api';
import names from '../names';

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
	let eightBallMatch = message.text.match(/^\/8ball\s+.+/);
	if (! eightBallMatch) return next();

	const name = names.get(message.from);
	const reply = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)];

	api.sendMessage(message.chat.id, `${name}: ${reply}`);
};
