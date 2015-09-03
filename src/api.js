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
methods.onUpdate = function(cb) {
	onUpdateListeners.push(cb);
};

let poller = new UpdatePoller(`${config.url}/getUpdates`, (updates) => {
	updates.forEach((update) => {
		onUpdateListeners.forEach((listener) => listener(update));
	});
});
poller.start();

export default methods;
