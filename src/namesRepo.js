import Promise from 'bluebird';
import sqlite3 from 'sqlite3';

var db = new sqlite3.Database(__dirname + '/../data.db');
db = Promise.promisifyAll(db);

var dbReady = db.runAsync(`
	CREATE TABLE IF NOT EXISTS names (
		user_id INT,
		username VARCHAR(128),
		first_name VARCHAR(256),
		last_name VARCHAR(256),
		PRIMARY KEY (user_id)
	)
`);

function get(user_id) {
	return dbReady.then(() => {
		return db.getAsync(`SELECT * FROM names WHERE user_id = $user_id`, {$user_id: user_id});
	});
}

function set(user_id, username = "", first_name = "", last_name = "") {
	let params = {
		$user_id: user_id,
		$username: username,
		$first_name: first_name,
		$last_name: last_name
	};

	return dbReady.then(() => {
		return get(user_id);
	}).then((oldStats) => {
		if (! oldStats) {
			return db.runAsync(`
				INSERT INTO names (user_id, username, first_name, last_name)
				VALUES ($user_id, $username, $first_name, $last_name)
			`, params);
		} else {
			return db.runAsync(`
				UPDATE names SET username = $username, first_name = $first_name, last_name = $last_name
				WHERE user_id = $user_id
			`, params);
		}
	});
}

function del(user_id) {
	return dbReady.then(() => {
		return db.runAsync(`DELETE FROM names WHERE user_id = $user_id`, {$user_id: user_id});
	});
}

export default {get, set, del};
