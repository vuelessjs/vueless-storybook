#!/usr/bin/env node

import fs from "fs";
import path from "path";

function copyFolderSync(source, target) {
  if (fs.existsSync(target)) {
    const timestamp = new Date().valueOf();
    const renamedTarget = `${target}-${timestamp}`;

    fs.renameSync(target, renamedTarget);
    console.log(`Renamed existing ${path.basename(target)} to ${path.basename(renamedTarget)}`);
  }

  fs.mkdirSync(target, { recursive: true });

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const srcFile = path.join(source, file);
    const destFile = path.join(target, file);
    const stat = fs.lstatSync(srcFile);

    stat.isDirectory() ? copyFolderSync(srcFile, destFile) : fs.copyFileSync(srcFile, destFile);
  });
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const sourceFolder = path.join(__dirname, ".storybook");
const targetFolder = path.join(__dirname, "..", "..", "..", ".storybook");

copyFolderSync(sourceFolder, targetFolder);
