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

export default methods;
