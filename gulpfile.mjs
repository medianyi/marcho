import { src, dest, watch, parallel, series } from 'gulp';
import sass from 'gulp-sass';
import * as sassCompiler from 'sass'; // Используем импорт * as
import concat from 'gulp-concat';
import uglify from 'gulp-uglify-es';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import { deleteAsync as del } from 'del';
import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import nunjucksRender from 'gulp-nunjucks-render';
import newer from 'gulp-newer';

const sassCompilerInstance = sass(sassCompiler);

const browserSyncInstance = browserSync.create();






function browsersync() {
  browserSyncInstance.init({
    server: {
      baseDir: 'app/'
    },
    notify: false,
  });
}

function nunjucks() {
  return src('app/*.njk')
    .pipe(nunjucksRender())
    .pipe(dest('app'))
    .pipe(browserSyncInstance.stream());
}


async function styles() {
  return src([
    'app/scss/*.scss',
  ])
    .pipe(sassCompilerInstance({ outputStyle: 'compressed' }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))

    .pipe(dest('app/css'))
    .pipe(browserSyncInstance.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js', // jQuery
    'node_modules/slick-carousel/slick/slick.js', // Slick
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js', // Slick
    'node_modules/rateyo/src/jquery.rateyo.js',
    'node_modules/ion-rangeslider/js/ion.rangeSlider.min.js',
    'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
    'app/js/main.js' // Ваш файл с инициализацие'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify.default())
    .pipe(dest('app/js'))
    .pipe(browserSyncInstance.stream());
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
  watch(['app/**/*.scss'], styles);
  watch(['app/*.njk'], nunjucks);
  watch(['app/js/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSyncInstance.reload);
  watch(['app/*.html']).on('change', browserSyncInstance.reload);
}



export {
  styles,
  scripts,
  browsersync,
  watching,
  images,
  cleanDist,
  nunjucks
};

export const build = series(cleanDist, images, building);
export default parallel(nunjucks, styles, scripts, browsersync, watching);

