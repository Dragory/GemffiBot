import api from '../api';
import cmd from '../cmd';
import markov from '../markov';
import markovRepo from '../markovRepo';

export default function(message, next) {
	if (! message.text) return next();

    let match = cmd.match(message.text, 'generate_stats');
	if (! match) return next();

	let formatNum = (num, maxDecimals = null, decimalSeparator = '.', thousandsSeparator = ',') => {
		if (typeof maxDecimals !== 'undefined') {
			num = parseFloat(num, 10).toFixed(maxDecimals);
		}

		let [numStr, decimals] = num.toString().split('.');

		let formatted = "";
		for (let i = 0; i < numStr.length; i++) {
			if (i !== 0 && i % 3 === 0) formatted += thousandsSeparator;
			formatted += numStr[numStr.length - 1 - i];
		}

		formatted = formatted.split("").reverse().join("");
		if (decimals) formatted += decimalSeparator + decimals;

		return formatted;
	};

	markovRepo.get(message.chat.id).then((table) => {
		// Generate dummy text
		markov.generateText(table, 64, 'tekstin alku');
		let genStats = markov.getGenStats();
		let genStatsFormatted = Object.keys(genStats).reduce((arr, key) => {
			arr.push(`    ${key}: ${genStats[key]}ms`);
			return arr;
		}, []).join('\n');

		let keys = Object.keys(table).length;
		let keysForKeys = Object.keys(table).reduce((total, key) => {
			return total + Object.keys(table[key]).length;
		}, 0);

		api.sendMessage(message.chat.id, `Stats for /generate:
Markov table keys: ${formatNum(keys)}
Markov table values for keys: ${formatNum(keysForKeys)}
Avg. values per key: ${formatNum(keysForKeys/keys, 2)}
Gen stats:\n${genStatsFormatted}`);
	});
}
