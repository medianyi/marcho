import { src, dest, watch, parallel, series } from 'gulp';
import sass from 'gulp-sass';
import * as sassCompiler from 'sass'; // Используем импорт * as
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import { deleteAsync as del } from 'del';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';

const sassCompilerInstance = sass(sassCompiler);

const browserSyncInstance = browserSync.create();

async function styles() {
  return src([
    'app/scss/style.scss',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css' // Путь к вашему CSS файлу
  ])
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(sassCompilerInstance({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSyncInstance.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js', // jQuery
    'node_modules/slick-carousel/slick/slick.js', // Slick
    'app/js/jquery.fancybox.min.js', // Slick
    'app/js/main.js' // Ваш файл с инициализацие'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify.default())
    .pipe(dest('app/js'))
    .pipe(browserSyncInstance.stream());
}

function browsersync() {
  browserSyncInstance.init({
    server: {
      baseDir: 'app/'
    },
  });
}

function cleanDist() {
  return del('dist');
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/**/*.html',
  ], { base: 'app' })
    .pipe(dest('dist'));
}

function images() {
  return src('app/images/**/*', {
    encoding: false
  })
    .pipe(imagemin())
    .pipe(dest('dist/images'));
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSyncInstance.reload);
}



export {
  styles,
  scripts,
  browsersync,
  watching,
  images,
  cleanDist
};

export const build = series(cleanDist, images, building);
export default parallel(styles, scripts, browsersync, watching);

