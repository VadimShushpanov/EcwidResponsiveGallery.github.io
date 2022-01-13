let gulp = require("gulp");
let rename = require("gulp-rename");
let sass = require("gulp-sass")(require("sass"));
let browserSync = require("browser-sync").create();

function scssToCss(done) {
  gulp
    .src(["./src/scss/**/*.scss", "./src/components/**/*.scss"])
    .pipe(
      sass({
        errorLogToConsole: true,
        outputStyle: "compressed",
      })
    )
    .on("error", console.error.bind(console))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./src/css/"))
    .pipe(browserSync.stream());

  gulp
    .src(["./src/scss/**/*.scss", "./src/components/**/*.scss"])
    .pipe(
      sass({
        errorLogToConsole: true,
        outputStyle: "compressed",
      })
    )
    .on("error", console.error.bind(console))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./src/css/"))
    .pipe(browserSync.stream());
  done();
}

function sync(done) {
  browserSync.init({
    server: {
      baseDir: "./src",
    },
    port: 8080,
  });
  done();
}

function browserReload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch("./**/*.scss", scssToCss);
  gulp.watch("./**/*.html", browserReload);
  gulp.watch("./**/*.js", browserReload);
}

gulp.task("default", gulp.parallel(sync, watchFiles));
