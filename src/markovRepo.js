import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

var dbReady = db.runAsync(`
	CREATE TABLE IF NOT EXISTS markov (
		chat_id INT,
		\`table\` TEXT,
		PRIMARY KEY (chat_id)
	)
`);

function get(chat_id) {
	return dbReady.then(() => {
		return db.getAsync(`
			SELECT * FROM markov
			WHERE chat_id = $chat_id
		`, {$chat_id: chat_id}).then((row) => {
			if (! row) return null;
			return JSON.parse(row.table);
		});
	});
}

function update(chat_id, table) {
	let params = {
		$chat_id: chat_id,
		$table: JSON.stringify(table)
	};

	return db.runAsync(`
		UPDATE markov SET \`table\` = $table WHERE chat_id = $chat_id
	`, params);
}

function create(chat_id, table) {
	let params = {
		$chat_id: chat_id,
		$table: JSON.stringify(table)
	};

	return db.runAsync(`
		INSERT INTO markov (chat_id, \`table\`) VALUES ($chat_id, $table)
	`, params);
}

function set(chat_id, table) {
	return dbReady.then(() => {
		return get(chat_id);
	}).then((table) => {
		if (table) {
			// Update
			return update(chat_id, table);
		} else {
			// Create
			return create(char_id, table);
		}
	});
}

export default {get, set, create, update};
