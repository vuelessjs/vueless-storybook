import fs from "fs";
import path from "path";
import { cwd } from "node:process";
import { readFile } from "fs/promises";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
import {
  VUELESS_CACHE_DIR,
  VUELESS_LOCAL_DIR,
  VUELESS_PACKAGE_DIR,
  SRC_USER_COMPONENTS_DIR,
  VUELESS_USER_COMPONENTS_DIR,
} from "vueless/constants.js";

const WEB_TYPES_CONFIG_FILE_NAME = "web-types.config";

export async function extractConfig() {
  const fileContent = await readFile(path.join(cwd(), "package.json"), "utf-8");
  const packageJson = JSON.parse(fileContent);

  const config = await getConfig();

  const components = config?.isVuelessEnv
    ? [`${VUELESS_LOCAL_DIR}/**/*.vue`]
    : [
        `${VUELESS_PACKAGE_DIR}/**/*.vue`,
        `${SRC_USER_COMPONENTS_DIR}/**/*.vue`,
        `${VUELESS_USER_COMPONENTS_DIR}/**/*.vue`,
      ];

  return {
    cwd: cwd(),
    components,
    outFile: `./${VUELESS_CACHE_DIR}/web-types.json`,
    packageName: packageJson["name"],
    packageVersion: packageJson["version"],
    descriptionMarkup: "markdown",
    typesSyntax: "typescript",
    ...config,
  };
}

async function getConfig() {
  const configPathJs = path.resolve(cwd(), `${WEB_TYPES_CONFIG_FILE_NAME}.js`);
  const configPathTs = path.resolve(cwd(), `${WEB_TYPES_CONFIG_FILE_NAME}.ts`);
  const configOutPath = path.join(cwd(), `${VUELESS_CACHE_DIR}/${WEB_TYPES_CONFIG_FILE_NAME}.mjs`);

  let config = {};

  if (!fs.existsSync(configPathJs) && !fs.existsSync(configPathTs)) {
    return config;
  }

  fs.existsSync(configPathJs) && (await buildConfig(configPathJs, configOutPath));
  fs.existsSync(configPathTs) && (await buildConfig(configPathTs, configOutPath));

  if (fs.existsSync(configOutPath)) {
    const configModule = await import(pathToFileURL(configOutPath));

    config = configModule.default;
  }

  return config;
}

async function buildConfig(entryPath, configOutFile) {
  await esbuild.build({
    entryPoints: [entryPath],
    outfile: configOutFile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "ESNext",
    loader: { ".ts": "ts" },
  });
}
