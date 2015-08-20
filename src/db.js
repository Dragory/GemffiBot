import fs from 'fs';

const basePath = __dirname + '/..';

function get(name, def) {
	const file = `${basePath}/${name}.json`;
	let exists = true;

	try {
		fs.statSync(file);
	} catch (e) {
		if (e.code === 'ENOENT') {
			exists = false;
		}
	}

	if (exists) {
		let content;
		try {
			// If the file exists but we can't read it, don't overwrite it
			content = fs.readFileSync(file, {encoding: 'utf8'});
		} catch (e) {
			content = '{}';
		}

		return JSON.parse(content);
	} else {
		let defContent = def || {};
		fs.writeFile(file, JSON.stringify(defContent, null, 4), {encoding: 'utf8'});

		return defContent;
	}
}

function set(name, data) {
	const file = `${basePath}/${name}.json`;
	console.log(`Saving to ${file} data with length ${JSON.stringify(data, null, 4).length}`);
	fs.writeFile(file, JSON.stringify(data, null, 4), {encoding: 'utf8'});
}

export default {
	get,
	set
};
