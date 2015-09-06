import api from './api';

var info = {};

function loadMe() {
	api.getMe(function(err, res, body) {
		try {
			let me = JSON.parse(body);
			Object.assign(info, me.result);
		} catch (e) {
			console.log(`getMe error: ${e.toString()}`);
			console.log(`getMe body: ${body}`);
			loadMe();
		}
	});
}

loadMe();

export default info;
