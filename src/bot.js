import request from 'request';
import config from './config';
import shutdown from './shutdown';

import eightBallCmd from './commands/8ball';
import rollCmd from './commands/roll';
import statsCmd from './commands/stats';
import aiCmd from './commands/ai';
import quoteCmd from './commands/quote';

shutdown.onExit(function(type) {
	console.log('exiting', type);
});

let commands = [
	statsCmd,
	eightBallCmd,
	rollCmd,
	aiCmd,
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

function updateHandler(updates) {
	updates.forEach(function(update) {
		if (! update.message || ! update.message.text) return;

		var i = -1;
		function callNext() {
			i++;
			if (! commands[i]) return;
			commands[i](update.message, callNext);
		}

		callNext();
	});
}

let poller = new UpdatePoller(`${config.url}/getUpdates`, updateHandler);
poller.start();
