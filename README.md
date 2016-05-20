# gulp-metalsmith
Đây là base đơn giản metalsmith, mọi config đều nằm trong file config.js
```js
const config = {
    contentRoot: './content', // thư mục chứa content file cho metalsmith
    buildRoot:   './build',   // thư mục chứa output của metalsmith
    layoutRoot:  './layout',  // thư mục layout của handlebars
    styleRoot:   './style',   // thư mục chứa style sass -> buildRoot/css/
    scriptRoot:  './script',  // thư mục chứa script của site
    staticRoot:  './static',  // thư mục chứa script, font, css của các vendor (bootstrap, foundation...)

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
```
