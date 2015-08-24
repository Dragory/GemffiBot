import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

var dbReady = db.runAsync("CREATE TABLE IF NOT EXISTS stats (chat_id INT, user_id INT, stats TEXT, PRIMARY KEY (chat_id, user_id))");

function get(chat_id, user_id) {
	return dbReady.then(() => {
		return db.getAsync(`SELECT * FROM stats WHERE chat_id = $chat_id AND user_id = $user_id`, {$chat_id: chat_id, $user_id: user_id});
	})
	.then((v) => {
		return (v ? JSON.parse(v.stats) : null);
	});
}

function set(chat_id, user_id, stats) {
	if (typeof stats === "object") stats = JSON.stringify(stats);

	let params = {
		$chat_id: chat_id,
		$user_id: user_id,
		$stats: stats
	};

	return dbReady.then(() => {
		return get(chat_id, user_id);
	}).then((oldStats) => {
		if (! oldStats) {
			return db.runAsync(`INSERT INTO stats (chat_id, user_id, stats) VALUES ($chat_id, $user_id, $stats)`, params);
		} else {
			return db.runAsync(`UPDATE stats SET stats = $stats WHERE chat_id = $chat_id AND user_id = $user_id`, params);
		}
	});
}

export default {get, set};
