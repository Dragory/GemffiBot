export default {
	onExit(cb) {
		var called = false;

		function runCb(type) {
			if (called) return;
			called = true;
			cb(type);
		}

		process.once('exit', runCb.bind(null, 'exit')); // process.exit()
		process.once('SIGTERM', runCb.bind(null, 'SIGTERM')); // something
		process.once('SIGINT', runCb.bind(null, 'SIGINT')); // ctrl+c
		process.once('SIGUSR2', runCb.bind(null, 'SIGUSR2')); // nodemon
		process.once('uncaughtException', function(e) {
			console.log(e);
			cb();
		}); // exceptions
	}
};
