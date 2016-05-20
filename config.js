const config = {
    contentRoot: './content',
    buildRoot:   './build',
    layoutRoot:  './layout',
    styleRoot:   './style',
    scriptRoot:  './script',
    staticRoot:  './static',

    style: {
        prefix: ['> 1%', 'last 2 versions', 'IE >= 9']
    }
};

config.metalsmith = {
    'metalsmith-matters':       {
        'delims':  ['```json', '```'],
        'options': {
            'lang': 'json'
        }
    },
    'metalsmith-markdown':      {},
    'metalsmith-layouts':       {
        'engine':    'handlebars',
        'directory': config.layoutRoot,
        'partials':  config.layoutRoot + '/partial'
    },
    'metalsmith-html-minifier': {
        "_metalsmith_if":        "production",
        "removeAttributeQuotes": false,
        "keepClosingSlash":      true
    }
};

module.exports = config;
