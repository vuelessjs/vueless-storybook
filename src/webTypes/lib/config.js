import fs from "fs";
import path from "path";
import { cwd } from "node:process";
import { readFile } from "fs/promises";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";

const CACHE_PATH = "./node_modules/.cache/vueless";
const WEB_TYPES_CONFIG_FILE_NAME = "web-types.config";

export async function extractConfig() {
  const fileContent = await readFile(path.join(cwd(), "package.json"), "utf-8");
  const packageJson = JSON.parse(fileContent);

  const config = await getConfig();

  const components = config?.isVuelessEnv
    ? ["src/**/*.vue"]
    : ["node_modules/vueless/**/*.vue", "src/components/**/*.vue", ".vueless/components/**/*.vue"];

  return {
    cwd: cwd(),
    components,
    outFile: `${CACHE_PATH}/web-types.json`,
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
  const configOutPath = path.join(cwd(), `${CACHE_PATH}/${WEB_TYPES_CONFIG_FILE_NAME}.mjs`);

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
