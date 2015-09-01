import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

let placeholders = (count) => '?'.repeat(count).split('').join(', ');

var dbReady = db.runAsync(`
	CREATE TABLE IF NOT EXISTS roll_wins (
		chat_id INT,
		user_id INT,
		num INT,
		date DATETIME,
		PRIMARY KEY (chat_id, user_id, num)
	)
`).then(() => {
	// For fetching the roll wins of a specific chat
	return db.runAsync(`
		CREATE INDEX IF NOT EXISTS roll_wins_chat_index ON roll_wins (chat_id)
	`);
}).then(() => {
	// For fetching the roll wins of a specific user (in a specific chat)
	return db.runAsync(`
		CREATE INDEX IF NOT EXISTS roll_wins_chat_user_index ON roll_wins (chat_id, user_id)
	`);
}).then(() => {
	// To make sure there's only one win per num per chat
	return db.runAsync(`
		CREATE UNIQUE INDEX IF NOT EXISTS roll_wins_chat_num_unique ON roll_wins (chat_id, num)
	`);
});

function allByUser(chat_id, user_id) {
	return dbReady.then(() => {
		return db.allAsync(`
			SELECT * FROM roll_wins
			LEFT JOIN names ON roll_wins.user_id = names.user_id
			WHERE chat_id = $chat_id AND user_id = $user_id
		`, {$chat_id: chat_id, $user_id: user_id});
	});
}

function allByChat(chat_id) {
	return dbReady.then(() => {
		return db.allAsync(`
			SELECT * FROM roll_wins
			LEFT JOIN names ON roll_wins.user_id = names.user_id
			WHERE chat_id = $chat_id
		`, {$chat_id: chat_id});
	});
}

function getByNum(chat_id, num) {
	return dbReady.then(() => {
		return db.getAsync(`
			SELECT * FROM roll_wins
			LEFT JOIN names ON roll_wins.user_id = names.user_id
			WHERE chat_id = $chat_id AND num = $num
		`, {$chat_id: chat_id, $num: num});
	});
}

function create(params) {
	let cols = Object.keys(params),
	    vals = cols.map((col) => params[col]);

	return dbReady.then(() => {
		return db.runAsync(`INSERT INTO roll_wins (${cols.join(', ')}) VALUES (${placeholders(vals.length)})`, vals);
	});
}

function del(chat_id, num) {
	return dbReady.then(() => {
		return db.runAsync(`DELETE FROM roll_wins WHERE chat_id = $chat_id AND num = $num`, {$chat_id: chat_id, $num: num});
	});
}

export default {allByUser, allByChat, getByNum, create, del};
