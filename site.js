const site = {
    port:        8080,        // cổng server local sẻ sử dụng
    contentRoot: './content', // thư mục chứa content file cho metalsmith
    buildRoot:   './build',   // thư mục chứa output của metalsmith
    layoutRoot:  './layout',  // thư mục layout của handlebars

    // thư mục chứa site style
    // sẽ build vào ${buildRoot}/css/
    styleRoot: './style',

    scriptRoot: './script',   // thư mục chứa site script cho site

    // thư mục chứa các script, css, fonts, image của vendor
    // tât cả sẽ được copy (giữ nguyên câu trúc) qua ${buildRoot}
    // ở chế độ production cũng sẽ không minify
    assetRoot: './asset',

    // global metadata của site
    metadata: {
        url: 'http://handy.themes.zone'
    }
};

site.script = {
    concat: false, // merge các file script lại thành 1 file duy nhất
    files:  [
        // // jquery
        // 'bower_components/jquery/dist/jquery.js',

        // // core foundation
        // 'bower_components/foundation-sites/js/foundation.core.js',
        // 'bower_components/foundation-sites/js/foundation.util.*.js',

        // thêm các file script của site ở đây
        `${site.scriptRoot}/!(app).js`, // các file có tên khác 'app.js'
        `${site.scriptRoot}/app.js`
    ]
};

site.style = {
    sass:         {
        // đường dẫn tơi các thư viện sass, có thể load bằng @import
        includePaths: [
            'bower_components/foundation-sites/scss'
        ]
    },
    uncss:        {
        html:   ['src/**/*.html'],
        ignore: [/.foundation-mq/, /^\.is-.*/]
    },
    autoprefixer: {
        browsers: ['last 2 versions', 'IE >= 9']
    }
};

// define và config các plugin của metalsmith
site.metalsmith = {
    'metalsmith-drafts':        {
        'enable': false
    },
    'metalsmith-matters':       {
        'enable':  true,
        'delims':  ['```json', '```'],
        'options': {
            'lang': 'json'
        }
    },
    'metalsmith-markdown':      {
        'enable':      true,
        'smartypants': true,
        'smartLists':  true,
        'gfm':         true,
        'tables':      true
    },
    'metalsmith-permalinks':    {
        'enable':   false,
        'pattern':  ':collection/:title',
        'relative': false
    },
    'metalsmith-collections':   {
        'enable': false,
        'items':  {
            'pattern': 'items/**/*.md',
            'sortBy':  'date',
            'reverse': true
        }
    },
    'metalsmith-pagination':    {
        'enable':            false,
        'collections.items': {
            'perPage':   6,
            'layout':    'items.html',
            'first':     'items/index.html',
            'filter':    'isMenu === false',
            'noPageOne': true,
            'path':      'items/:num/index.html'
        }
    },
    'metalsmith-layouts':       {
        'enable':    true,
        'engine':    'handlebars',
        'directory': config.layoutRoot,
        'partials':  config.layoutRoot + '/partial'
    },
    'metalsmith-html-minifier': {
        'enable':                true,
        'removeAttributeQuotes': false,
        'keepClosingSlash':      true
    }
};

module.exports = site;
