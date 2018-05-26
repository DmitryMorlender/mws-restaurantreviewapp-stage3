let gulp = require('gulp');
let cssnano = require('gulp-cssnano');
let uglify = require('gulp-uglify');
let concat = require('gulp-concat');
let csso = require('gulp-csso');
let autoprefixer = require('gulp-autoprefixer');
let babel = require('gulp-babel');
let image = require('gulp-image');
let imagemin = require('gulp-imagemin');
let imageminPngquant = require('imagemin-pngquant');
let imageminZopfli = require('imagemin-zopfli');
let imageminMozjpeg = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
let imageminGiflossy = require('imagemin-giflossy');
let imageminWebp = require('imagemin-webp');
let webp = require('gulp-webp');
let rename = require('gulp-rename');
let responsive = require('gulp-responsive-images');

const del = require('del');
const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

// Gulp task to minify CSS files
gulp.task('styles', function () {
    return gulp.src('css/styles.css')
      // Auto-prefix css styles for cross browser compatibility
      .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      // Minify the file
      .pipe(csso())
      .pipe(rename('styles.min.css'))
      // Output
      .pipe(gulp.dest('dist/css'))
  });

  
  gulp.task('webp', () =>
      gulp.src('img/*.*')
      .pipe(webp({
          quality: 80,
          preset: 'photo',
          method: 6
      }))
      .pipe(gulp.dest('dist/img'))
  );

  gulp.task('webp-in-dist', () =>
  gulp.src('dist/img/*.*')
  .pipe(webp({
      quality: 80,
      preset: 'photo',
      method: 6
  }))
  .pipe(gulp.dest('dist/img'))
);


  gulp.task('compress-images', function () {
    gulp.src('img/*.*')
      .pipe(image())
      .pipe(gulp.dest('dist/img'));
  });

  gulp.task('compress-webp-images-in-dist', function () {
    gulp.src('dist/img/*.*')
      .pipe(image())
      .pipe(gulp.dest('dist/img'));
  });

  gulp.task('resize-images', function () {
    gulp.src('img/*.*')
      .pipe(responsive({
        'default-image_450.png': [{
          width: 300,
          rename: {suffix: '-300w'},
          quality: 70
        }, {
          width: 600,
          rename: {suffix: '-600w'},
          quality: 75
        }],
        '*.jpg': [{
          width: 300,
          reanme: {suffix: '-300w'},
          quality: 70
        },{
          width: 600,
          rename : {suffix: '-600w'},
          quality: 75
        }],
      },{
        imageMagick: true
      }))
      .pipe(gulp.dest('dist/img'));
  });

  



// Clean output directory
gulp.task('clean', () => del(['dist']));