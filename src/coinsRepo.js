import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

var dbReady = db.runAsync(`
	CREATE TABLE IF NOT EXISTS coins (
		chat_id INT,
		user_id INT,
		coins INT,
		PRIMARY KEY (chat_id, user_id)
	)
`).then(() => {
	return db.runAsync(`
		CREATE INDEX IF NOT EXISTS coins_chat_id ON coins (chat_id)
	`);
});

function all(chat_id) {
	return dbReady.then(() => {
		return db.allAsync(`
			SELECT * FROM coins
			LEFT JOIN names ON names.user_id = coins.user_id
			WHERE chat_id = $chat_id
		`, {$chat_id: chat_id});
	});
}

function get(chat_id, user_id) {
	return dbReady.then(() => {
		return db.getAsync(
			`SELECT * FROM coins WHERE chat_id = $chat_id AND user_id = $user_id`,
			{$chat_id: chat_id, $user_id: user_id}
		).then((row) => {
			if (row && row.coins < 10) {
				return db.runAsync(
					`UPDATE coins SET coins = $coins WHERE chat_id = $chat_id AND user_id = $user_id`,
					{$chat_id: chat_id, $user_id: user_id, $coins: 10}
				).then(() => {
					return get(chat_id, user_id);
				});
			}

			if (row) return row.coins;

			// If there was no coin record, set the default
			return db.runAsync(
				`INSERT INTO coins (chat_id, user_id, coins) VALUES ($chat_id, $user_id, $coins)`,
				{$chat_id: chat_id, $user_id: user_id, $coins: 1000}
			).then(() => {
				return get(chat_id, user_id);
			});
		});
	});
}

function set(chat_id, user_id, coins) {
	let params = {
		$chat_id: chat_id,
		$user_id: user_id,
		$coins: coins
	};

	return dbReady.then(() => {
		return get(chat_id, user_id);
	}).then(() => {
		// We know the record exists now, because get() creates one if it doesn't
		return db.runAsync(`
			UPDATE coins SET coins = $coins
			WHERE chat_id = $chat_id AND user_id = $user_id
		`, params);
	});
}

function del(user_id) {
	return dbReady.then(() => {
		return db.runAsync(`DELETE FROM coins WHERE chat_id = $chat_id AND user_id = $user_id`, {$chat_id: chat_id, $user_id: user_id});
	});
}

export default {all, get, set, del};
