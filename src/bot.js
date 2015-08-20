import "babel/polyfill";

import request from 'request';
import config from './config';
import shutdown from './shutdown';

import eightBallCmd from './commands/8ball';
import rollCmd from './commands/roll';
import statsCmd from './commands/stats';
import aiCmd from './commands/ai';
import idCmd from './commands/id';
import oiCmd from './commands/oi';
import quoteCmd from './commands/quote';

shutdown.onExit(function(type) {
	console.log('exiting', type);
});

let commands = [
	statsCmd,
	eightBallCmd,
	rollCmd,
	aiCmd,
	idCmd,
	oiCmd,
	quoteCmd
];

// Longpolling yay
class UpdatePoller {
	constructor(url, cb) {
		this.url = url;
		this.cb = cb || function() {};

		this.running = false;
		this.lastUpdateId = 0;
	}

	start() {
		this.running = true;
		this.poll();
	}

	end() {
		this.running = false;
	}

	poll() {
		const query = {
			timeout: 60,
			offset: this.lastUpdateId + 1
		};

		request({url: this.url, qs: query}, (err, res, body) => {
			if (! err && res.statusCode === 200) {
				let data = JSON.parse(body);

				if (data.result.length > 0) {
					this.lastUpdateId = data.result[data.result.length - 1].update_id;
					this.cb(data.result);
				}
			}

			if (this.running) this.poll();
		});
	}
}

let spam = {};
setInterval(function() {
	Object.keys(spam).forEach(function(key) {
		spam[key] = (spam[key] > 0 ? spam[key] - 1 : 0);
	});
}, 3000);

function updateHandler(updates) {
	updates.forEach(function(update) {
		if (! update.message || ! update.message.text) return;
		spam[update.message.from.id] = spam[update.message.from.id] || 0;
		spam[update.message.from.id]++;

		if (spam[update.message.from.id] > 2) return;

		var i = -1;
		function callNext() {
			i++;
			if (! commands[i]) {
				// If we went through all commands, i.e. didn't trigger any, reduce their spamcount by one
				spam[update.message.from.id]--;
				return;
			}
			commands[i](update.message, callNext);
		}

		callNext();
	});
}

let poller = new UpdatePoller(`${config.url}/getUpdates`, updateHandler);
poller.start();
