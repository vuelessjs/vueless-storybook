import fs from "fs";
import path from "path";
import { readFile } from "fs/promises";
import esbuild from "esbuild";

const CACHE_PATH = "./node_modules/.cache/vueless";
const WEB_TYPES_CONFIG_FILE_NAME = "web-types.config";

export async function extractConfig(cwd, watch = false, configFileFromCmd, pathArray = []) {
  const [outFileFromCmd] = pathArray;

  const fileContent = await readFile(path.join(cwd, "package.json"), "utf-8");
  const packageJson = JSON.parse(fileContent);

  const config = await getConfig(configFileFromCmd);

  const components = config?.isVuelessEnv
    ? [`${process.cwd()}/src/**/*.vue`]
    : [
        `${process.cwd()}/node_modules/vueless/**/*.vue`,
        `${process.cwd()}/src/components/**/*.vue`,
      ];

  return {
    cwd,
    watch,
    components,
    componentsRoot: cwd,
    outFile: outFileFromCmd || `${CACHE_PATH}/web-types.json`,
    packageName: packageJson["name"],
    packageVersion: packageJson["version"],
    descriptionMarkup: "markdown",
    typesSyntax: "typescript",
    ...config,
  };
}

async function getConfig(configFromCmd) {
  const configPathFromCmd = configFromCmd && path.resolve(process.cwd(), configFromCmd);
  const configPathJs = path.resolve(process.cwd(), `${WEB_TYPES_CONFIG_FILE_NAME}.js`);
  const configPathTs = path.resolve(process.cwd(), `${WEB_TYPES_CONFIG_FILE_NAME}.ts`);
  const configOutPath = path.join(process.cwd(), `${CACHE_PATH}/${WEB_TYPES_CONFIG_FILE_NAME}.mjs`);

  let config = {};

  if (!fs.existsSync(configPathJs) && !fs.existsSync(configPathTs)) {
    return config;
  }

  fs.existsSync(configPathJs) && (await buildConfig(configPathJs, configOutPath));
  fs.existsSync(configPathTs) && (await buildConfig(configPathTs, configOutPath));
  fs.existsSync(configPathFromCmd) && (await buildConfig(configPathFromCmd, configPathFromCmd));

  if (fs.existsSync(configOutPath)) {
    config = (await import(configOutPath)).default;
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
