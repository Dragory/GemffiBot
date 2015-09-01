import moment from 'moment';
import api from '../api';
import config from '../config';
import names from '../names';
import me from '../me';
import rollWinsRepo from '../rollWinsRepo';

export default function(message, next) {
	let dMatch = message.text.match('^\/d((?:\-)?[0-9]+)');
	if (dMatch !== null) message.text = '/roll ' + dMatch[1];

	let rollMatch = message.text.match(new RegExp(`^\\/roll(?:@${me.username})?(?:\\s+(.+))?`));
	if (rollMatch === null) return next();

	const name = names.short(message.from);

	if (rollMatch[1] && rollMatch[1].slice(0, 9) === 'stats set' && config.admins.indexOf(message.from.id) !== -1) {
		let rollStats = rollMatch[1].slice(10);
		try { rollStats = JSON.parse(rollStats); } catch (e) {
			api.sendMessage(message.chat.id, `${name}: Invalid JSON: ${e.toString()}`);
			return;
		}

		rollWinsRepo.create(rollStats).then(() => {
			api.sendMessage(message.chat.id, `${name}: Done`);
		}).catch((e) => {
			api.sendMessage(message.chat.id, `${name}: ${e.toString()}`);
		});

		return;
	}

	if (rollMatch[1] && rollMatch[1].slice(0, 9) === 'stats del' && config.admins.indexOf(message.from.id) !== -1) {
		let num = parseInt(rollMatch[1].slice(10), 10) || 0;
		rollWinsRepo.del(message.chat.id, num).then(() => {
			api.sendMessage(message.chat.id, `${name}: Done`);
		});

		return;
	}

	if (rollMatch[1] && rollMatch[1].slice(0, 6) === 'double') {
		let doubleNum = parseInt(rollMatch[1].slice(7), 10);
		rollWinsRepo.getByNum(message.chat.id, doubleNum).then((row) => {
			if (! row || row.user_id !== message.from.id) {
				api.sendMessage(message.chat.id, `${name}: You don't have the ${doubleNum} win`);
				return;
			}

			let doDouble = Math.floor(Math.random() * 2);
			if (doDouble === 1) {
				// Ding ding ding
				let tryDouble = (num) => {
					rollWinsRepo.getByNum(message.chat.id, num).then((row) => {
						if (row) { tryDouble(num + 1); return; }
						rollWinsRepo.create({
							chat_id: message.chat.id,
							user_id: message.from.id,
							num: num,
							date: moment.utc().format('YYYY-MM-DD HH:mm:ss')
						}).then(() => {
							return rollWinsRepo.del(message.chat.id, doubleNum);
						}).then(() => {
							api.sendMessage(message.chat.id, `${name}: DING DING DING`);
						});
					});
				};

				tryDouble(doubleNum * 2);
			} else {
				// Wah wah waa
				rollWinsRepo.del(message.chat.id, doubleNum).then(() => {
					api.sendMessage(message.chat.id, `${name}: Wah wah waa`);
				});
			}
		});

		return;
	}

	if (rollMatch[1] === 'stats') {
		rollWinsRepo.allByChat(message.chat.id).then((wins) => {
			let userWins = {};

			wins.forEach((win) => {
				if (! userWins[win.user_id]) {
					userWins[win.user_id] = {
						user_id: win.user_id,
						wins: 0,
						win_rolls: [],
						name: names.short(win),
						total: 0
					};
				}

				userWins[win.user_id].wins++;
				userWins[win.user_id].win_rolls.push(win.num);
				userWins[win.user_id].total += win.num;
			});

			let userWinsArr = Object.keys(userWins).map((k) => userWins[k]);
			userWinsArr.sort((a, b) => (Math.abs(a.total) > Math.abs(b.total) ? -1 : 1));

			let responseMessage = userWinsArr.slice(0, 5).map((info, i) => {
				let rollsText = info.win_rolls.join(', ');
				let winText = (info.wins !== 1 ? 'wins' : 'win');

				return `${i + 1}. ${info.name} (${info.total} total, ${info.wins} ${winText}: ${rollsText})`;
			}).join('\n');

			api.sendMessage(message.chat.id, responseMessage);
		});

		return;
	}

	let rollNum = 100;
	if (rollMatch[1]) rollNum = parseInt(rollMatch[1], 10);
	if (isNaN(rollNum)) rollNum = 100;

	let result;

	if (rollNum === 0) {
		result = `ei nollasivusta noppaa oo olemassa vitun tyhmä`;
	} else {
		result = Math.floor(Math.random() * rollNum) + 1;
	}

	let rollResultText = result.toString();
	if (result === 420) {
		rollResultText += ' 🍁';
	}

	api.sendMessage(message.chat.id, `${name}: ${rollResultText}`);

	// If the roll result was the same as the rollNum, mark the user down as a "winner" for that number
	if (result === rollNum && Math.abs(rollNum) >= 100) {
		rollWinsRepo.getByNum(message.chat.id, result).then((row) => {
			if (row) throw 'win_exists'; // Someone already won this number, ignore

			return rollWinsRepo.create({
				chat_id: message.chat.id,
				user_id: message.from.id,
				num: result,
				date: moment.utc().format('YYYY-MM-DD HH:mm:ss')
			});
		}).then(() => {
			api.sendMessage(message.chat.id, `${name}: Winner is you! Now try doubling it with /roll double ${result}
See chatwide stats with /roll stats`);
		}).catch((e) => {
			if (e === 'win_exists') return;
			throw e;
		});
	}
};
