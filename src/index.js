#!/usr/bin/env node
/* eslint-disable no-console */

import fs, { promises } from "fs";
import { cwd } from "node:process";
import path from "path";

// Get the command-line arguments
const args = process.argv.slice(2);
const parsedArgs = parseArgs(args);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const source = path.join(__dirname, ".storybook");
const target = path.join(cwd(), ".storybook");

copyStorybookPreset(source, target);

await addStorybookCommands();

if (parsedArgs.pnpm) {
  await createNpmrc();
}

function copyStorybookPreset(source, target, { consoles = true } = {}) {
  if (fs.existsSync(target)) {
    const timestamp = new Date().valueOf();
    const renamedTarget = `${target}-backup-${timestamp}`;

    fs.renameSync(target, renamedTarget);

    coloredConsole(
      "yellow",
      `Current Storybook preset backed into : '${path.basename(renamedTarget)}' folder. Don't forget to remove it before commit.`,
    );
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
    coloredConsole(
      "green",
      `Storybook preset successfully saved into '${path.basename(target)}' folder.`,
    );
  }
}

async function addStorybookCommands() {
  try {
    const storybookCommands = {
      "sb:dev": "STORYBOOK_FULL=1 storybook dev -p 6006 --no-open",
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

async function createNpmrc() {
  const npmrcContent = [
    "# @vueless/storybook: pnpm: disable hoisting for the package related modules.",
    "public-hoist-pattern[] = *storybook*",
    "public-hoist-pattern[] = prettier2",
  ];

  const npmrcPath = path.join(cwd(), ".npmrc");

  try {
    await promises.writeFile(npmrcPath, npmrcContent.join("\n"));
  } catch (err) {
    console.error("Error writing .npmrc file:", err);
  }
}

function parseArgs(args) {
  const result = {};

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.split("=");
      const normalizedKey = key.substring(2);

      result[normalizedKey] = value !== undefined ? value : true;
    }
  });

  return result;
}

function coloredConsole(color, message) {
  let coloredMessage = message;

  if (color === "green") {
    coloredMessage = `\x1b[32m${message}\x1b[0m`;
  }

  if (color === "yellow") {
    coloredMessage = `\x1b[33m${message}\x1b[0m`;
  }

  if (color === "red") {
    coloredMessage = `\x1b[31m${message}\x1b[0m`;
  }

  /* Remove spaces and tabs around each line. */
  coloredMessage
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return console.log(coloredMessage);
}
