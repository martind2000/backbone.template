const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const cp = require('child_process');
const cssnano = require('cssnano');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackconfig = require('./webpack.config.js');
const webpackstream = require('webpack-stream');
const uglify = require('gulp-uglify');

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');

// Using: https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

// BrowserSync
function browserSync(done) {
  browsersync.init({
    'server': {
      'baseDir': './live/'
    },
    'port': 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(['./live/']);
}

// Lint scripts
function scriptsLint() {
  return gulp
    .src(['./app/**/*.js', './gulpfile.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function bb() {
  const b = browserify({
    'debug': true,
    'entries': './app/app.js'
  });

  return b.bundle().pipe(source('app.js'))
    .pipe(buffer())
    // .pipe(stripDebug())
    .pipe(rename('bundle.js'))

    .pipe(sourcemaps.init({ 'loadMaps': true }))
    // Add transformation tasks to the pipeline here.
    // .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./live/js'));
}

function scripts() {
  return (
    gulp
      .src(['./app/app.js'])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig), webpack)
      .pipe(uglify())
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest('./live/js/'))
      .pipe(browsersync.stream())
  );
}

// CSS task
function css() {
  return (
    gulp
      .src('./app/css/**/*.css')
      .pipe(plumber())
      .pipe(sass({ 'outputStyle': 'expanded' }))
      .pipe(gulp.dest('./live/css/'))
      .pipe(rename({ 'suffix': '.min' }))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(gulp.dest('./live/css/'))
      .pipe(browsersync.stream())
  );
}

function copy() {
  return(
    gulp.src(['./public/**/*']).pipe(gulp.dest('./live/'))
  );
}
// Watch files
function watchFiles() {
  gulp.watch('./app/css/**/*', css);
  gulp.watch('./app/**/*.js', gulp.series(scriptsLint, bb));

  /* gulp.watch(
      [
        "./_includes/!**!/!*",
        "./_layouts/!**!/!*",
        "./_pages/!**!/!*",
        "./_posts/!**!/!*",
        "./_projects/!**!/!*"
      ],
      gulp.series(jekyll, browserSyncReload)
  );
  gulp.watch("./assets/img/!**!/!*", images);*/
}

// define complex tasks
const js = gulp.series(scriptsLint, bb);
const build = gulp.series(clean, gulp.parallel(copy, css, js /* images, jekyll,*/ ));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
// exports.images = images;
exports.copy = copy;
exports.css = css;
exports.js = js;
// exports.jekyll = jekyll;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;

exports.bb = bb;
