import gulp from "gulp";
import imagemin from "gulp-imagemin";
import concat from "gulp-concat";
import sync from "browser-sync";
const browserSync = sync.create();
import uglify from "gulp-uglify";
import del from "del";
import autoprefixer from "gulp-autoprefixer";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import ghPages from "gulp-gh-pages";

const scss = gulpSass(dartSass);

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    notify: false,
  });
}

function styles() {
  return gulp
    .src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src("app/images/**/*.*")
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images/"));
}

function scripts() {
  return gulp.src(["app/js/main.js"]);
}

function build() {
  return gulp
    .src(["app/**/*.html", "app/css/style.min.css", "app/js/main.js"], {
      base: "app",
    })
    .pipe(gulp.dest("dist"));
}

function cleanDist() {
  return del("dist");
}

function watching() {
  gulp.watch(["app/scss/**/*.scss"], styles);
  gulp.watch(["app/js/**/*.js", "!app/js/main.js"], scripts);
  gulp.watch(["app/**/*.html"]).on("change", browserSync.reload);
}

gulp.task("deploy", function () {
  return gulp.src("./dist/**/*").pipe(ghPages());
});

export const stylesRun = styles;
export const scriptsRun = scripts;
export const browsersyncRun = browsersync;
export const watchRun = watching;
export const imagesRun = images;
export const cleanDistRun = cleanDist;
export const buildRun = gulp.series(cleanDist, images, build);

export const defaultrun = gulp.parallel(styles, scripts, browsersync, watching);
