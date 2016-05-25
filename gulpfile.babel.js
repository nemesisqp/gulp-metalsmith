'use strict';

const PROD = !!(require('yargs').argv.production);
const site = require('./site');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browser = require('browser-sync');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
require('./handlebars-helper')(Handlebars);

const MetalSmithProductionPlugins = ['metalsmith-html-minifier'];

// task build metalsmith
function metalsmith(done) {
    let ms = new Metalsmith(process.cwd());

    ms.source(site.contentRoot);
    ms.destination(site.buildRoot);
    ms.metadata(site.metadata ? site.metadata : {});

    // load cac metalsmith addon + options
    Object.keys(site.metalsmith).forEach(pluginName => {
        // load plugin đúng theo dev hoặc prod mode
        if (!PROD && MetalSmithProductionPlugins.indexOf(pluginName) != -1) {
            console.log(`plugin ${pluginName} chi su dung o production mode`);
            return;
        }

        let plugin = require(pluginName);
        let options = site.metalsmith[pluginName];
        if (options.enable && options.enable == false)
            return;

        // một số config thêm cho base metalsmith tùy theo plugin
        switch (pluginName) {
            case 'metalsmith-matters':
                // disable front matter nếu sữ dụng metalsmith-matters
                ms.frontmatter(false);
                ms.use(plugin(options));
                break;
            case 'metalsmith-html-minifier':
                ms.use(plugin('*.html', options));
                break;
            default:
                ms.use(plugin(options));
        }
    });

    ms.build(function (err) {
        if (err) {
            console.log(err);
            done(err);
        } else
            done();
    });
}

/**
 * build site's sass file, xử lý auto prefixer
 * tạo source map nếu ở chế độ debug
 * ở chế độ production apply các plugin: uncss, cssnano
 */
function sass() {
    let sassConfig = Object.assign({}, site.style.sass);
    sassConfig.outputStyle = PROD ? 'compressed' : 'expanded';
    return gulp.src(`${site.styleRoot}/**/*.{scss,sass}`)
        .pipe($.if(!PROD, $.sourcemaps.init()))
        .pipe($.sass(sassConfig)
            .on('error', $.sass.logError))
        .pipe($.autoprefixer(site.style.autoprefixer))
        .pipe($.if(PROD, $.uncss(site.style.uncss)))
        .pipe($.if(PROD, $.cssnano()))
        .pipe($.if(!PROD, $.sourcemaps.write()))
        .pipe(gulp.dest(`${site.buildRoot}/css`))
        .pipe(browser.reload({stream: true}));
}

/**
 * xử lý script của site
 * nếu ở chế độ debug thì tạo source map
 * nếu ở chế độ production thì minify
 * concat script thành app.js nếu ${site.script.concat} == true
 */
function script() {
    const IS_CONCAT = site.script.concat && site.script.concat === true;
    return gulp.src(site.script.files)
        .pipe($.if(!PROD, $.sourcemaps.init()))
        .pipe($.if(IS_CONCAT, $.concat('app.js')))
        .pipe($.if(PROD, $.uglify()
            .on('error', e => {
                console.log(e);
            })
        ))
        .pipe($.if(!PROD, $.sourcemaps.write()))
        .pipe(gulp.dest(`${site.buildRoot}/js`));
}

// copy moi thu trong thu muc ${site.assetRoot} sang ${site.buildRoot}
function asset() {
    return gulp.src(`${site.assetRoot}/**/*`)
        .pipe(gulp.dest(site.buildRoot));
}

// tạo local server host nội dung của ${site.buildRoot}
function server(done) {
    browser.init({
        server: site.buildRoot,
        port:   site.port
    });
    done();
}

function watch() {
    gulp.watch(['gulpfile.js', 'site.js'], ['default']);

    gulp.watch(`${site.assetRoot}/**/*`, gulp.series(asset, browser.reload));      // watch asset
    gulp.watch(`${site.styleRoot}/**/*.{scss,sass}`, sass);                        // watch style
    gulp.watch(`${site.scriptRoot}/**/*.js`, gulp.series(script, browser.reload)); // watch script
    gulp.watch([
        `${site.contentRoot}/**/*`,
        `${site.layoutRoot}/**/*`
    ], gulp.series(metalsmith, browser.reload));
}

// Xóa ${buildRoot} (metalsmith tự động xóa)
// build metalsmith, sass, javascript, image
// copy tất cả qua ${buildRoot}
gulp.task('build', gulp.series(metalsmith,
    gulp.parallel(asset, sass, script)));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series('build', server, watch));
