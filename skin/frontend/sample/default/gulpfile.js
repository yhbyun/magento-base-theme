
var gulp = require("gulp"),
    compass = require("gulp-compass"),
    cssnano = require('gulp-cssnano'),
    base64 = require('gulp-base64'),
    notify = require("gulp-notify"),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    debug = require('gulp-debug'),
    del = require('del'),
    fs = require('fs'),
    path = require('path');

var config = {
    verbose: process.argv.indexOf('--verbose') !== -1 ? true: false,

    env: 'development',

    useCssBase64: false, // base64 이미지 사용여부
    buildMinCss: false, // .min.css 생성여부

    devFolder: './src',
    distFolder: './',

    init: function () {
        this.src =  {
            js: path.join(this.devFolder, 'js'),
            sass: path.join(this.devFolder, 'scss'),
            font: path.join(this.devFolder, 'fonts')
        };

        this.dist =  {
            js: path.join(this.distFolder, 'js'),
            css: path.join(this.distFolder, 'css'),
            font: path.join(this.distFolder, 'fonts')
        },

        this.compassConfig = path.join(this.src.sass, 'config.rb');

        return this;
    }
}.init();

var handleErrors = function () {
    var args = Array.prototype.slice.call(arguments);

    // Send error to notification center with gulp-notify
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');
};

var isDev = function () {
    return config.env === 'development' ? true : false;
}

gulp.task('set-development', function() {
    config.env = 'development';
    gutil.log(gutil.colors.green('RUNNING IN DEVELOPMENT ENV'));
});

gulp.task('set-production', function() {
    config.env = 'production';
    gutil.log(gutil.colors.red('RUNNING IN PRODUCTION ENV'));
});

gulp.task('clean:styles', function () {
    return del(config.dist.css);
});

gulp.task('clean:fonts', function () {
    return del(config.dist.font);
});

gulp.task("styles", ['clean:styles'], function () {
    return gulp.src([
            path.join(config.src.sass, 'styles.scss'),
            path.join(config.src.sass, 'styles-ie8.scss')
        ])
        .pipe(gulpif(config.verbose, debug({title: 'styles'})))
        .pipe(compass({
            config_file: config.compassConfig,
            css: config.dist.css,
            sass: config.src.sass,
            environment: isDev() ? 'development' : 'production',
            sourcemap: isDev(),
            debug: false
        }))
        //.pipe(autoprefixer("last 3 version","safari 5", "ie 8", "ie 9"))
        .pipe(size())
        // include base64-dataurl
        .pipe(gulpif(
            config.useCssBase64,
            base64({
                extensions: ['svg', 'png'],
                debug: true
            })
         ))
        // getting filesize of css with data-images
        .pipe(gulpif(config.useCssBase64, size()))
        // minify css
        .pipe(gulpif(!isDev(), cssnano()))
        // rename to min
        .pipe(gulpif(config.buildMinCss, rename(function (path) {
            path.basename += ".min"
        })))
        .pipe(gulpif(!isDev(), gulp.dest(config.dist.css)))
        .pipe(gulpif(!isDev(), size()))
        .on('error', handleErrors)
        .pipe(notify({ message: 'Successfully compiled SCSS', onLast: true }));
});

// Fonts
gulp.task('fonts', ['clean:fonts'], function () {
    return gulp
        .src([
            'node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*',
            'node_modules/font-awesome/fonts/**/*'
        ])
        .pipe(gulpif(config.verbose, debug({title: 'fonts'})))
        .pipe(gulp.dest(config.dist.font))
        .pipe(notify({ message: 'Successfully processed font', onLast: true }));
});

gulp.task("watch", function(){
    gulp.watch(config.src.sass, ["styles"]);
});

gulp.task("build", ["styles", "fonts"]);

gulp.task('production', ['set-production', 'build']);

gulp.task('default', ['set-development', 'build']);

