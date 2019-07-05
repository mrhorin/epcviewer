var gulp = require('gulp');
var plumber = require('gulp-plumber');
var pug = require("gulp-pug");
var del = require('del');
var packager = require('electron-packager');
var package = require("./package.json");

gulp.task('watch', function(){
  gulp.watch(['src/pug/**/*.pug'], ['pug']);
});

// pugコンパイル
gulp.task('pug', function(cb){
  gulp.src('src/pug/**/*.pug')
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist/html/'));
  cb();
});

// distを空に
gulp.task('clean', function(cb) {
  del(['dist', '**/*.log'], cb);
  cb();
});

gulp.task('default', gulp.series('pug', function (cb) {
  cb();
}));

// macOS用にパッケージ化
gulp.task('package:darwin', gulp.series('default', function (cb) {
  packager({
    dir: './',
    out: 'release/darwin',
    name: package["name"],
    icon: "./src/img/darwin/icon_1024x1024.png.icns",
    "app-version": package["version"],
    "app-copyright": "Copyright (C) 2019 "+package["author"]+".",
    arch: 'x64',
    platform: 'darwin',
    overwrite: true,
    version: package['version'],
    ignore: ['release']
  }, function (err, path) {
    cb();
  });
  cb();
}));

// // Linux用にパッケージ化
gulp.task('package:linux', gulp.series('default', function (cb) {
  packager({
    dir: './',
    out: 'release/linux',
    name: package["name"],
    icon: "./src/img/darwin/icon_1024x1024.png.icns",
    "app-version": package["version"],
    "app-copyright": "Copyright (C) 2017 "+package["author"]+".",
    arch: 'x64',
    platform: 'linux',
    overwrite: true,
    version: package['version'],
    ignore: ['release']
  }, function (err, path) {
    cb();
  });
  cb();
}));