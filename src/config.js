import data from '../config.json';
data.url = data.url.replace(/\{token\}/g, data.token);

export default data;
