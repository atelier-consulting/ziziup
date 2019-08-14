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
    imgALL: 'src/img/*.*',
    imgDEMO: 'src/img/*-demo.*',
    js: 'src/js/*.js'
  },
  dev: {
    html: 'dev',
    css: 'dev/css',
    img: 'dev/img',
    js: 'dev/js'
  },
  prod: {
    html: 'prod',
    css: 'prod/css',
    img: 'prod/img',
    all: 'prod/**'
  },
  demo: {
    html: 'demo',
    css:  'demo/css',
    img: 'demo/img',
    js: 'demo/js',
    all: 'demo/**'
  }
};

gulp.task('serve', ['html', 'sass', 'imgDev', 'js'], function(){
  sync.init({
    server: './dev'
  });
  gulp.watch(path.src.html, ['html']);
  gulp.watch(path.src.scss, ['sass']);
  gulp.watch(path.src.img, ['imgAll']);
  gulp.watch(path.src.js, ['js']);
});

gulp.task('build', ['clean-prod', 'imgProd'], function(){
  gulp.src(path.src.scssPROD)
    .pipe(sass({errLogToConsole: true, outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(mini({keepSpecialComments: 0}))
    .pipe(rename('styles-v' + VERSION +'.min.css'))
    .pipe(gulp.dest(path.prod.css))
    ;
});

gulp.task('demo', ['clean-demo', 'imgDemo'], function(){
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

  gulp.src(path.src.html)
    .pipe(replace('%CSSPATH%', 'css/styles-v' + VERSION + '.min.css'))
    .pipe(replace('%VERSION%', VERSION))
    .pipe(gulp.dest(path.demo.html))
    ;

  gulp.src(path.src.js)
    .pipe(gulp.dest(path.demo.js))
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

gulp.task('imgDev', function(){
  return gulp.src(path.src.imgALL)
    .pipe(newer(path.dev.img))
    .pipe(gulp.dest(path.dev.img))
    .pipe(sync.stream())
    ;
});

gulp.task('imgDemo', function(){
  return gulp.src(path.src.imgALL)
    .pipe(newer(path.demo.img))
    .pipe(gulp.dest(path.demo.img))
    .pipe(sync.stream())
    ;
});

gulp.task('imgProd', function(){
  return gulp.src([path.src.imgALL, '!' + path.src.imgDEMO])
    .pipe(gulp.dest(path.prod.img))
    .pipe(sync.stream())
    ;
});

gulp.task('js', function(){
  return gulp.src(path.src.js)
    .pipe(gulp.dest(path.dev.js))
    .pipe(sync.stream())
    ;
});

gulp.task('default', ['serve']);

gulp.task('clean-demo', function(){
  del([path.demo.all]);
});

gulp.task('clean-prod', function(){
  del([path.prod.all]);
});
