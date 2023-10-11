/* eslint-disable */
const { series, parallel, src, dest, watch } = require("gulp");
const gulp = require("gulp");
const prefix = require("gulp-autoprefixer");
const sass = require("gulp-sass")(require("sass"));
const clean = require("gulp-clean");
const zip = require("gulp-zip");
const debug = require("gulp-debug");

const GLOB_TEMPLATE = ["src/template.json"];
const GLOB_SCSS = ["src/scss/**/*.scss"];
const GLOB_SCRIPTS = ["src/scripts/**"];
const GLOB_TEMPLATES = ["src/templates/**"];
const GLOB_LANGS = ["src/lang/**"];

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit("end");
}

function compileScss() {
  // Configure options for sass output. For example, "expanded" or "nested"
  let options = {
    outputStyle: "expanded",
  };
  return gulp
    .src(GLOB_SCSS)
    .pipe(sass(options).on("error", handleError))
    .pipe(
      prefix({
        cascade: false,
      }),
    )
    .pipe(dest("dist/styles/"));
}

function cleanDist() {
  return src("dist/", { read: false }).pipe(clean());
}

function copyLicense() {
  return src("LICENSE.txt").pipe(dest("dist/"));
}

function copySystem() {
  return src("src/system.json").pipe(dest("dist/"));
}

function copyTemplate() {
  return src(GLOB_TEMPLATE).pipe(dest("dist/"));
}

function copyTemplates() {
  return src(GLOB_TEMPLATES).pipe(dest("dist/templates/"));
}

function copyLang() {
  return src(GLOB_LANGS).pipe(dest("dist/lang/"));
}

function copyAssets() {
  return src("src/assets/**").pipe(dest("dist/assets/"));
}

function copyScripts() {
  return src(GLOB_SCRIPTS).pipe(dest("dist/scripts/"));
}

function watchTemplate() {
  return watch(GLOB_TEMPLATE, copyTemplate);
}

function watchScss() {
  return watch(GLOB_SCSS, compileScss);
}

function watchScripts() {
  return watch(GLOB_SCRIPTS, copyScripts);
}

function watchTemplates() {
  return watch(GLOB_TEMPLATES, compileScss);
}

function watchLangs() {
  return watch(GLOB_LANGS, copyLang);
}

function zipRelease() {
  return src(["dist/**/*"]).pipe(zip("lhtrpg.zip")).pipe(dest("dist"));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = series(
  cleanDist,
  parallel(
    compileScss,
    copyLicense,
    copySystem,
    copyTemplate,
    copyTemplates,
    copyLang,
    copyAssets,
    copyScripts,
  ),
  parallel(watchScss, watchScripts, watchTemplates, watchLangs, watchTemplate),
);

exports.build = series(
  cleanDist,
  parallel(
    compileScss,
    copyLicense,
    copySystem,
    copyTemplate,
    copyTemplates,
    copyLang,
    copyAssets,
    copyScripts,
  ),
);

exports.release = series(
  cleanDist,
  parallel(
    compileScss,
    copyLicense,
    copySystem,
    copyTemplate,
    copyTemplates,
    copyLang,
    copyAssets,
    copyScripts,
  ),
  zipRelease,
);
