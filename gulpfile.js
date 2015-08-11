var gulp = require('gulp'),
    babel = require('gulp-babel'),
    del = require('del');

gulp.task('clean', function(cb) {
	del('dist/*', cb);
});

gulp.task('default', ['clean'], function() {
	return gulp.src('src/**/*.js')
		.pipe(babel({
			'optional': ['es7.classProperties', 'es7.functionBind']
		}))
		.on('error', function(err) {
			console.error(err.toString());
			this.emit('end');
		})
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['default'], function() {
	gulp.watch('src/**/*.js', ['default']);
});
