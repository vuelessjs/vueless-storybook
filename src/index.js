#!/usr/bin/env node

import fs, { promises } from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const source = path.join(__dirname, ".storybook");
const target = path.join(__dirname, "..", "..", "..", ".storybook");

copyStorybookPreset(source, target);

await addStorybookCommands();

function copyStorybookPreset(source, target) {
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

    stat.isDirectory()
      ? copyStorybookPreset(srcFile, destFile)
      : fs.copyFileSync(srcFile, destFile);
  });
}

async function addStorybookCommands() {
  try {
    const storybookCommands = {
      "sb:dev-full": "STORYBOOK_FULL=1 storybook dev -p 6006 --no-open",
      "sb:dev": "storybook dev -p 6006 --docs --no-open",
      "sb:build": "NO_PWA=1 storybook build --docs",
      "sb:preview": "vite preview --host --outDir=storybook-static",
    };

    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    const data = await promises.readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(data);

    packageJson.scripts = { ...packageJson.scripts, ...storybookCommands };

    await promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
  } catch (error) {
    console.error("Error:", error);
  }
}
