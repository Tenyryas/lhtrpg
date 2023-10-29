/* eslint-disable */
import { promises as fs } from "fs";
import path from "path";

import clean from "gulp-clean";
import * as dartSass from "sass";
import debug from "gulp-debug";
import gulp from "gulp";
import gulpSass from "gulp-sass";
import prefix from "gulp-autoprefixer";
import zip from "gulp-zip";
import ts from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";

import { compilePack } from "@foundryvtt/foundryvtt-cli";

const { series, parallel, src, dest, watch } = gulp;

const sassCompiler = gulpSass(dartSass);

const GLOB_SCSS = ["src/scss/**/*.scss"];
const GLOB_TS = ["src/scripts/**/*.ts"];
const GLOB_SRC = [
  "src/**/*",
  "!src/scss{/**,}",
  "!src/packs{/**,}",
  `!${GLOB_TS}`,
];

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
    .pipe(sassCompiler(options).on("error", handleError))
    .pipe(
      prefix({
        cascade: false,
      }),
    )
    .pipe(dest("dist/styles/"));
}

const tsProject = ts.createProject("tsconfig.json");
function compileTs() {
  return gulp
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write(".", { sourceRoot: "./", includeContent: false }))
    .pipe(gulp.dest("dist/scripts/"));
}

function cleanDist() {
  return src("dist/", { read: false, allowEmpty: true }).pipe(clean());
}

function copyLicense() {
  return src("LICENSE.txt").pipe(dest("dist/"));
}

function copySrc() {
  return src(GLOB_SRC, { base: "src" }).pipe(dest("dist/"));
}

async function copyPack() {
  const packs = await fs.readdir(path.join("src", "packs"));
  for (const pack of packs) {
    if (pack === ".gitattributes") continue;
    console.log("Packing " + pack);
    const src = path.join("src", "packs", pack);
    const dest = path.join("dist", "packs", pack);
    await compilePack(src, dest, {
      log: true,
    });
  }
}

function watchSrc() {
  return watch(GLOB_SRC, copySrc);
}

function watchScss() {
  return watch(GLOB_SCSS, compileScss);
}

function watchTs() {
  return watch(GLOB_TS, compileTs);
}

function zipRelease() {
  return src(["dist/**/*"]).pipe(zip("lhtrpg.zip")).pipe(dest("dist"));
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

export default series(
  cleanDist,
  parallel(compileScss, copySrc, copyLicense, copyPack),
  parallel(watchScss, watchSrc),
);

const build = series(
  cleanDist,
  parallel(compileScss, copySrc, copyLicense, copyPack),
);

const release = series(
  cleanDist,
  parallel(compileScss, copySrc, copyLicense, copyPack),
  zipRelease,
);

export { build, release };
