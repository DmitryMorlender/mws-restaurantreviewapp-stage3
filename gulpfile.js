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

  gulp.task('compress-images', function () {
    gulp.src('img/*.*')
      .pipe(image())
      .pipe(gulp.dest('dist/img'));
  });



// Clean output directory
gulp.task('clean', () => del(['dist']));