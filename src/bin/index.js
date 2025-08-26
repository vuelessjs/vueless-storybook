#!/usr/bin/env node
/* eslint-disable no-console */

import path from "node:path";
import { cwd } from "node:process";
import { styleText } from "node:util";
import fs, { promises } from "node:fs";
import { detectTypeScript } from "vueless/utils/node/helper.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const sourceTs = path.join(__dirname, "..", ".storybook-ts");
const sourceJs = path.join(__dirname, "..", ".storybook-js");
const target = path.join(cwd(), ".storybook");

const hasTypeScript = await detectTypeScript();

hasTypeScript ? copyStorybookPreset(sourceTs, target) : copyStorybookPreset(sourceJs, target);

await addStorybookCommands();

/**
 * Copy Storybook preset to target directory.
 * @param {string} source - Source directory.
 * @param {string} target - Target directory.
 * @param {Object} options - Options object.
 * @param {boolean} options.consoles - Show console messages.
 */
function copyStorybookPreset(source, target, { consoles = true } = {}) {
  if (fs.existsSync(target)) {
    const timestamp = new Date().valueOf();
    const renamedTarget = `${target}-backup-${timestamp}`;

    fs.renameSync(target, renamedTarget);

    const warnMessage = styleText(
      "yellow",
      `Current Storybook preset backed into : '${path.basename(renamedTarget)}' folder. Remove it before commit.`,
    );

    console.log(warnMessage);
  }

  fs.mkdirSync(target, { recursive: true });

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const srcFile = path.join(source, file);
    const destFile = path.join(target, file);
    const stat = fs.lstatSync(srcFile);

    stat.isDirectory()
      ? copyStorybookPreset(srcFile, destFile, { consoles: false })
      : fs.copyFileSync(srcFile, destFile);
  });

  if (consoles) {
    const successMessage = styleText(
      "green",
      `Storybook preset successfully saved into '${path.basename(target)}' folder.`,
    );

    console.log(successMessage);
  }
}

/**
 * Add Storybook commands to package.json.
 */
async function addStorybookCommands() {
  try {
    const storybookCommands = {
      "sb:dev": "storybook dev -p 6006 --no-open",
      "sb:dev:docs": "storybook dev -p 6006 --docs --no-open",
      "sb:build": "storybook build --docs",
      "sb:preview": "vite preview --host --outDir=storybook-static",
    };

    const packageJsonPath = path.resolve(cwd(), "package.json");
    const data = await promises.readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(data);

    packageJson.scripts = { ...packageJson.scripts, ...storybookCommands };

    await promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  } catch (error) {
    console.error("Error:", error);
  }
}
