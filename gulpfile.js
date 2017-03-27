var gulp = require('gulp');
var sync = require('browser-sync').create();
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var newer = require('gulp-newer');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var mini = require('gulp-cssmin');
var del = require('del');
var prefix = require('gulp-autoprefixer');

var VERSION = process.env.npm_package_version;

var path = {
  src: {
    html: 'src/**/*.html',
    scss: 'src/sass/**/*.scss',
    scssPROD: 'src/sass/prod.scss',
    scssDEMO: 'src/sass/demo.scss',
    img : 'src/img/*.*'
  },
  dev: {
    html: 'dev',
    css: 'dev/css',
    img: 'dev/img'
  },
  prod: {
    html: 'prod',
    css: 'prod/css',
    img: 'prod/img'
  },
  demo: {
    html: 'demo',
    css:  'demo/css',
    img: 'demo/img'
  }
};

gulp.task('serve', ['html', 'sass', 'img'], function(){
  sync.init({
    server: './dev'
  });
  gulp.watch(path.src.html, ['html']);
  gulp.watch(path.src.scss, ['sass']);
  gulp.watch(path.src.img, ['img']);
});

gulp.task('build', function(){
  del([path.prod.html]);

  gulp.src(path.src.scssPROD)
    .pipe(sass({errLogToConsole: true, outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(mini({keepSpecialComments: 0}))
    .pipe(rename('styles-v' + VERSION +'.min.css'))
    .pipe(gulp.dest(path.prod.css))
    ;

  gulp.src(path.src.img)
    .pipe(gulp.dest(path.prod.img))
    ;
});

gulp.task('demo', function(){
  del([path.demo.html]);

  gulp.src(path.src.scssDEMO)
    .pipe(sass({errLogToConsole: true, outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(
      prefix({
        browsers: [
          'ie >= 10',
          'safari >= 6.1'
        ],
        cascade: false
      })
    )
    .pipe(mini({keepSpecialComments: 0}))
    .pipe(rename('styles-v' + VERSION +'.min.css'))
    .pipe(gulp.dest(path.demo.css))
    ;

  gulp.src(path.src.img)
    .pipe(gulp.dest(path.demo.img))
    ;

  gulp.src(path.src.html)
    .pipe(replace('%CSSPATH%', 'css/styles-v' + VERSION + '.min.css'))
    .pipe(replace('%VERSION%', VERSION))
    .pipe(gulp.dest(path.demo.html))
    ;
})

gulp.task('sass', function(){
  return gulp.src(path.src.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true, outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dev.css))
    .pipe(sync.stream())
    ;
});

gulp.task('html', function(){
  return gulp.src(path.src.html)
    .pipe(replace('%CSSPATH%', 'css/dev.css'))
    .pipe(replace('%VERSION%', VERSION))
    .pipe(gulp.dest(path.dev.html))
    .pipe(sync.stream())
    ;
});

gulp.task('img', function(){
  return gulp.src(path.src.img)
    .pipe(newer(path.dev.img))
    .pipe(gulp.dest(path.dev.img))
    .pipe(sync.stream())
    ;
});

gulp.task('default', ['serve']);
