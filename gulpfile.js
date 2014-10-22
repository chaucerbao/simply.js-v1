'use strict';

/* Source and destination paths */
var paths = {
  css: { src: './src/css/', dest: './dist/' },
  js: { src: './src/js/', dest: './dist/' }
};

/* Files */
var files = {
  css: { src: [paths.css.src + '**/*.styl', '!' + paths.css.src + '**/_*.styl'], dest: 'simply.min.css' },
  js: { src: [paths.js.src + '**/*.js'], dest: 'simply.min.js' }
};

/* Plugins */
var gulp = require('gulp'),
  del = require('del'),
  rename = require('gulp-rename'),
  gzip = require('gulp-gzip'),
  stylus = require('gulp-stylus'),
  postcss = require('gulp-postcss'),
  postcssProcessors = [require('autoprefixer-core')],
  minifyCSS = require('gulp-minify-css'),
  browserify = require('browserify'),
  transform = require('vinyl-transform'),
  uglify = require('gulp-uglify');

/* Tasks */
gulp.task('watch', ['build'], function() {
  gulp.watch(files.css.src[0], ['css']);
  gulp.watch(files.js.src, ['js']);
});

gulp.task('compress', function() {
  gulp.src(paths.css.dest + '/**/*.css')
    .pipe(gzip())
    .pipe(gulp.dest(paths.css.dest));
  gulp.src(paths.js.dest + '/**/*.js')
    .pipe(gzip())
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('clean', function() {
  del([paths.css.dest, paths.js.dest]);
});

gulp.task('css', function() {
  gulp.src(paths.css.src + 'main.styl', { base: paths.css.src })
    .pipe(stylus({ 'include css': true }))
    .pipe(postcss(postcssProcessors))
    .pipe(minifyCSS({ keepSpecialComments: 0 }))
    .pipe(rename(files.css.dest))
    .pipe(gulp.dest(paths.css.dest));
});

gulp.task('js', function() {
  var browserified = transform(function(file) {
    return browserify(file).bundle();
  });

  gulp.src(paths.js.src + 'main.js', { base: paths.js.src })
    .pipe(browserified)
    .pipe(uglify())
    .pipe(rename(files.js.dest))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('build', ['css', 'js']);
gulp.task('dist', ['build', 'compress']);
gulp.task('default', ['watch']);
