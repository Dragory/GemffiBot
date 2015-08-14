import data from '../config.json';
data.url = data.url.replace(/\{token\}/g, data.token);

// Extend default values
let config = Object.assign({}, {
	"token": "",
	"url": "https://api.telegram.org/bot{token}",
	"lastReset": "2015-07-01T00:00:00.000Z",
	"cleverbotIoUser": "",
	"cleverbotIoKey": "",
	"admins": [],
	"quoteBanned": []
}, data);

export default config;
