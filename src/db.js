import fs from 'fs';

const basePath = __dirname + '/..';

function get(name, def) {
	const file = `${basePath}/${name}.json`;

	try {
		let content = fs.readFileSync(file, {encoding: 'utf8'});
		return JSON.parse(content);
	} catch (e) {
		let defContent = def || {};
		fs.writeFile(file, JSON.stringify(defContent, null, 4), {encoding: 'utf8'});

		return defContent;
	}
}

function set(name, data) {
	const file = `${basePath}/${name}.json`;
	fs.writeFile(file, JSON.stringify(data, null, 4), {encoding: 'utf8'});
}

export default {
	get,
	set
};
