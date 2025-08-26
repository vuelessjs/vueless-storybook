/* eslint-disable no-console */

import path from "node:path";
import { cwd } from "node:process";
import { styleText } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { cpSync, renameSync, existsSync } from "node:fs";

import { detectTypeScript } from "vueless/utils/node/helper.js";

/**
 * Initializes the Storybook configuration by determining the appropriate settings for TypeScript or JavaScript projects.
 * It copies the corresponding Storybook preset directory and adds Storybook-related commands to the project.
 * This function handles the setup required for running Storybook in the current project.
 *
 * @return {Promise<void>} A promise that resolves once the initialization process is complete.
 */
export async function storybookInit() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const sourceTs = path.join(__dirname, "..", ".storybook-ts");
  const sourceJs = path.join(__dirname, "..", ".storybook-js");
  const target = path.join(cwd(), ".storybook");

  (await detectTypeScript())
    ? copyStorybookPreset(sourceTs, target)
    : copyStorybookPreset(sourceJs, target);

  await addStorybookCommands();
}

/**
 * Copy Storybook preset to target directory.
 * @param {string} source - Source directory.
 * @param {string} target - Target directory.
 * @param {Object} options - Options object.
 * @param {boolean} options.consoles - Show console messages.
 */
function copyStorybookPreset(source, target, { consoles = true } = {}) {
  if (existsSync(target)) {
    const timestamp = Date.now();
    const renamedTarget = `${target}-backup-${timestamp}`;

    renameSync(target, renamedTarget);

    if (consoles) {
      console.log(
        styleText(
          "yellow",
          `Current Storybook preset backed into: '${path.basename(renamedTarget)}'. Remove it before commit.`,
        ),
      );
    }
  }

  cpSync(source, target, { recursive: true, force: true });

  if (consoles) {
    console.log(
      styleText("green", `Storybook preset successfully saved into '${path.basename(target)}'.`),
    );
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
    const data = await readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(data);

    packageJson.scripts = { ...packageJson.scripts, ...storybookCommands };

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n", "utf8");
  } catch (error) {
    console.error("Error:", error);
  }
}
