import api from './api';

var info = {};

api.getMe(function(err, res, body) {
	let me = JSON.parse(body);
	Object.assign(info, me.result);
});

export default info;
