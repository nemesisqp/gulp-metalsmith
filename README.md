### gulp-metalsmith
#### Cài đặt
* clone project
* npm install
* bower install (nếu project sử dụng bower để quản lý frontend library)

#### Sử dụng
```js
npm build              // build chế độ development
npm watch              // watch chế độ development
npm build --production // build chế độ production
npm watch --production // watch chế độ production
```

Đây là base đơn giản metalsmith, mọi cấu hình đều nằm trong file site.js
#### Cấu hình các đường dẫn
```js
const site = {
    port:        8080,        // cổng server local sẻ sử dụng
    contentRoot: './content', // thư mục chứa content file cho metalsmith
    buildRoot:   './build',   // thư mục chứa output của metalsmith
    layoutRoot:  './layout',  // thư mục layout của handlebars

    // thư mục chứa style của site, sẽ build vào ${buildRoot}/css/
    styleRoot: './style',

    // thư mục chứa style của site, sẽ build vào ${buildRoot}/js/
    scriptRoot: './script',

    // thư mục chứa các script, css, fonts, image của vendor
    // tât cả sẽ được copy (giữ nguyên câu trúc) qua ${buildRoot}
    // ở chế độ production cũng sẽ không minify
    assetRoot: './asset',

    // global metadata của site
    metadata: {
        url: 'http://handy.themes.zone'
    }
};
```

#### Cấu hình cho build javascript
```js
site.script = {
    concat: true, // concat == true sẽ nhập các file script lại thành 1 file duy nhất
    concatName: 'app.js',
    files:  [
        // // jquery
        // 'bower_components/jquery/dist/jquery.js',

        // // core foundation
        // 'bower_components/foundation-sites/js/foundation.core.js',
        // 'bower_components/foundation-sites/js/foundation.util.*.js',

        // thêm các file script của site ở đây
        // muốn concat đúng thứ tự thì phải define path
        `${site.scriptRoot}/!(app).js` // các file có tên khác 'app.js'
    ]
};
```

#### Cấu hình cho build style css, sass
```js
site.style = {
    sass:         {
        // đường dẫn tơi các thư viện sass, có thể load bằng @import
        includePaths: [
            'bower_components/foundation-sites/scss'
        ]
    },
    autoprefixer: {
        browsers: ['last 2 versions', 'IE >= 9']
    }
};
```
