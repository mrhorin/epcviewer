var gulp = require('gulp');
var plumber = require('gulp-plumber');
var pug = require("gulp-pug");
var del = require('del');
// var packager = require('electron-packager');
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
