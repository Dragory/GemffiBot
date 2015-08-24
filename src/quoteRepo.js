import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

var dbReady = db.runAsync(`CREATE TABLE IF NOT EXISTS quotes (
	chat_id INT,
	user_id INT,
	trigger VARCHAR(64),
	quote TEXT,
	\`date\` DATETIME,
	PRIMARY KEY (chat_id, trigger)
)`);

let placeholders = (count) => '?'.repeat(count).split('').join(', ');

function get(chat_id, trigger) {
	return dbReady.then(() => {
		return db.getAsync(`SELECT * FROM quotes WHERE chat_id = $chat_id AND \`trigger\` = $trigger`, {$chat_id: chat_id, $trigger: trigger});
	});
}

function create(params) {
	let cols = Object.keys(params),
	    vals = cols.map((col) => params[col]);

	return dbReady.then(() => {
		return db.runAsync(`INSERT INTO quotes (${cols.join(', ')}) VALUES (${placeholders(vals.length)})`, vals);
	});
}

function update(chat_id, trigger, params) {
	let updates = Object.keys(params).map((col) => {
		return `${col} = ?`;
	});

	let vals = Object.keys(params).map((col) => params[col]);

	return dbReady.then(() => {
		return db.runAsync(`UPDATE quotes SET ${updates.join(', ')} WHERE chat_id = ? AND trigger = ?`, vals.concat([chat_id, trigger]));
	});
}

function del(chat_id, trigger) {
	return dbReady.then(() => {
		return db.runAsync(`DELETE FROM quotes WHERE chat_id = $chat_id AND trigger = $trigger`, {$chat_id: chat_id, $trigger: trigger});
	});
}

export default {get, create, update, del};
