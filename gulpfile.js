'use strict';

let PROD = true;

const argv = require('minimist')(process.argv.slice(2));
if (argv['dev']) PROD = false;

const config = require('./config');

const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpPlumber = require('gulp-plumber');
const gulpRunSequence = require('run-sequence');
const gulpSass = require('gulp-sass');
const gulpUglify = require('gulp-uglify');
const gulpRename = require('gulp-rename');
const gulpAutoPrefixer = require('gulp-autoprefixer');

const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
require('./handlebars-helper')(Handlebars);

function gulpBlockError() {
    return gulpPlumber({
        errorHandler: (err) => {
            console.log(err);
        }
    })
}

// task build metalsmith
gulp.task('metalsmith', callback => {
    let ms = new Metalsmith(process.cwd());

    ms.source(config.contentRoot);
    ms.destination(config.buildRoot);
    ms.metadata(config.metadata ? config.metadata : {});

    // load cac metalsmith addon + config
    Object.keys(config.metalsmith).forEach(key => {
        let plugin = require(key);
        let options = config.metalsmith[key];

        let usePlugin = true;
        if (options._metalsmith_if !== undefined) {
            if (options._metalsmith_if === 'production') {
                usePlugin = PROD === true;
            } else {
                usePlugin = false;
            }

            options._metalsmith_if = undefined;
            delete options._metalsmith_if;
        }

        if (!usePlugin) return;
        if (key === 'metalsmith-matters')
            ms.frontmatter(false); // disable front matter

        options._metalsmith_if = undefined;
        delete options._metalsmith_if;

        switch (key) {
            case 'metalsmith-html-minifier':
                console.log('metalsmith-html-minifier', options);
                ms.use(plugin('*.html', options));
                break;
            default:
                ms.use(plugin(options));
        }
    });

    ms.build(function (err) {
        if (err) {
            console.log(err);
            callback(err);
        } else
            callback();
    });
});

// minify js code, chua concat
gulp.task('minify-js', () => {
    return gulp.src(config.scriptRoot + '/**/*')
        .pipe(gulpBlockError())
        .pipe(gulpRename({suffix: '.min'}))
        .pipe(gulpUglify())
        .pipe(gulp.dest(config.buildRoot + '/js'));
});

// hien tai chi chep script output vo build (chua build coffee, typescript gi ca)
gulp.task('script', () => {
    return gulp.src(config.scriptRoot + '/**/*')
        .pipe(gulpBlockError())
        .pipe(gulp.dest(config.buildRoot));
});

// build sass
gulp.task('sass', () => {
    return gulp.src([config.styleRoot + '/**/*.scss', config.styleRoot + '/**/*.sass'])
        .pipe(gulpBlockError())
        .pipe(gulpSass({
            includePaths: [config.styleRoot],
            outputStyle:  PROD ? 'compressed' : 'expanded'
        }).on('error', gulpSass.logError))
        .pipe(gulpAutoPrefixer({
            browsers: config.style.prefix,
            cascade:  false
        }))
        .pipe(gulp.dest(config.buildRoot + '/css'));
});

gulp.task('style', callback => {
    gulpRunSequence(['sass'], callback);
});

// task xử lý static resource, copy mọi thứ trong thư mục static vô thư mục build
gulp.task('static', () => {
    return gulp.src(config.staticRoot + '/**/*')
        .pipe(gulpBlockError())
        .pipe(gulp.dest(config.buildRoot));
});

gulp.task('watch', [], () => {
    // watch thay doi trong layout va content folder -> build metalsmith
    watch([
        config.contentRoot + '/**/*',
        config.layoutRoot + '/**/*'
    ], function () {
        gulp.start(['metalsmith']);
    });

    // what thay đổi trong thư mục static
    watch([config.staticRoot + '/**/*'], () => {
        gulp.start(['static']);
    });

    // watch thay doi trong style folder -> build style (SASS)
    watch([config.styleRoot + '/**/*'], () => {
        gulp.start(['style']);
    });

    // watch thay doi trong script folder -> chep vo thu muc build
    watch([config.scriptRoot + '/**/*'], () => {
        gulp.start(['script']);
    });
});

gulp.task('default', callback => {
    gulpRunSequence('metalsmith', ['static', 'style', 'minify-js'], callback);
});
