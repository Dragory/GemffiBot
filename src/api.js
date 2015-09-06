import request from 'request';
import config from './config';

let methods = {};

methods.sendMessage = function(chatId, text) {
	return request.post({
		url: `${config.url}/sendMessage`,
		form: {
			chat_id: chatId,
			text: text
		}
	});
};

methods.getMe = function(cb) {
	return request.get({
		url: `${config.url}/getMe`
	}, cb);
};

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

let onUpdateListeners = [];
let updateQueue = []; // FIFO
let waiting = true;

methods.onUpdate = function(cb) {
	onUpdateListeners.push(cb);
};

function callListeners(update) {
	onUpdateListeners.forEach((listener) => listener(update));
}

methods.nextUpdate = function() {
	if (updateQueue.length === 0) {
		waiting = true;
		return;
	}

	callListeners(updateQueue.shift());
	waiting = false;
}

let poller = new UpdatePoller(`${config.url}/getUpdates`, (updates) => {
	updateQueue = updateQueue.concat(updates);
	if (waiting) methods.nextUpdate();
});
poller.start();

export default methods;
