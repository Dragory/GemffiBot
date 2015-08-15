export default {
	onExit(cb) {
		var called = false;

		function runCb(type) {
			if (called) return;
			called = true;
			cb(type);

			// Because it's a "once" like binding, we don't have to worry about
			// infinite recursion here, or even the CB running twice
			process.exit();
		}

		process.once('exit', runCb.bind(null, 'exit', false)); // process.exit()
		process.once('SIGTERM', runCb.bind(null, 'SIGTERM')); // something
		process.once('SIGINT', runCb.bind(null, 'SIGINT')); // ctrl+c
		process.once('SIGUSR2', runCb.bind(null, 'SIGUSR2')); // nodemon
		process.once('uncaughtException', function(e) {
			cb();
			// Again, "once" -> no recursion
			throw e;
		}); // exceptions
	}
};
