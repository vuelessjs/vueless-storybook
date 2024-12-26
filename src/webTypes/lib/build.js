import fs from "node:fs";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { mkdirp } from "mkdirp";
import chokidar from "chokidar";
import { globbySync } from "globby";
import { parse } from "vue-docgen-api";
import _ from "lodash-es";
import { vuelessConfig } from "./vuelessConfig.js";

export default async function build(config) {
  config.componentsRoot = path.resolve(config.cwd, config.componentsRoot);
  config.outFile = path.resolve(config.cwd, config.outFile);

  const { watcher, componentFiles } = getSources(config.components, config.componentsRoot);

  const cache = {};
  const buildWebTypesBound = rebuild.bind(null, config, componentFiles, cache, watcher);

  try {
    await buildWebTypesBound();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error building web-types: " + e.message);
    await watcher.close();

    return;
  }

  if (config.watch) {
    watcher
      .on("add", buildWebTypesBound)
      .on("change", buildWebTypesBound)
      .on("unlink", async (filePath) => {
        // eslint-disable-next-line no-console
        console.log("Rebuilding on file removal " + filePath);

        delete cache[filePath];
        await writeDownWebTypesFile(config, Object.values(cache), config.outFile);
      });
  } else {
    await watcher.close();
  }
}

function getSources(components, cwd) {
  const watcher = chokidar.watch(components, { cwd });
  const allComponentFiles = globbySync(components, { cwd });

  return { watcher, componentFiles: allComponentFiles };
}

async function rebuild(config, files, cachedContent, watcher, changedFilePath) {
  const cacheWebTypesContent = async (filePath) => {
    cachedContent[filePath.replace(/\\/g, "/")] = await extractInformation(
      path.join(config.componentsRoot, filePath),
      config,
    );

    return true;
  };

  if (changedFilePath) {
    // eslint-disable-next-line no-console
    console.log("Rebuilding on update file " + changedFilePath);

    try {
      // If in chokidar mode (watch), the path of the file that was just changed
      // is passed as an argument. We only affect the changed file and avoid re-parsing the rest
      await cacheWebTypesContent(changedFilePath);
    } catch (e) {
      throw new Error(
        `Error building file ${config.outFile} when file ${changedFilePath} has changed: ${e.message}`,
      );
    }
  } else {
    try {
      // if we are initializing the current file, parse all components
      await Promise.all(files.map(cacheWebTypesContent));
    } catch (e) {
      throw new Error(`Error building file ${config.outFile}: ${e.message}`);
    }
  }

  // and finally, save all concatenated values to the Markdown file
  await writeDownWebTypesFile(config, Object.values(cachedContent), config.outFile);
}

async function writeDownWebTypesFile(config, definitions, destFilePath) {
  const destFolder = path.dirname(destFilePath);

  await mkdirp(destFolder);
  let writeStream = fs.createWriteStream(destFilePath);

  const contents = {
    framework: "vue",
    name: config.packageName,
    version: config.packageVersion,
    contributions: {
      html: {
        "description-markup": config.descriptionMarkup,
        "types-syntax": config.typesSyntax,
        tags: _(definitions)
          .flatMap((d) => d.tags || [])
          .orderBy("name", "asc")
          .value(),
        attributes: _(definitions)
          .flatMap((d) => d.attributes || [])
          .orderBy("name", "asc")
          .value(),
        "vue-filters": _(definitions)
          .flatMap((d) => d["vue-filters"] || [])
          .orderBy("name", "asc")
          .value(),
      },
    },
  };

  const html = contents.contributions.html;

  if (!html.tags?.length) html.tags = undefined;
  if (!html.attributes?.length) html.attributes = undefined;
  if (!html["vue-filters"]?.length) html["vue-filters"] = undefined;

  writeStream.write(JSON.stringify(contents, null, 2));
  writeStream.close();
}

function ensureRelative(path) {
  // The .replace() is a fix for paths that end up like "./src\\components\\General\\VerticalButton.vue" on windows machines.
  return (path.startsWith("./") || path.startsWith("../") ? path : "./" + path).replace(/\\/g, "/");
}

export function getDefaultConfigJson(fileContents) {
  const objectStartIndex = fileContents.indexOf("{");
  const objectString = fileContents.substring(objectStartIndex).replace("};", "}");

  // indirect eval
  return (0, eval)("(" + objectString + ")"); // Converting into JS object
}

function getDefaultConfigFileName(folderPath) {
  const folder = fs.readdirSync(path.dirname(folderPath));

  return folder.find((file) => file === "config.js" || file === "config.ts") || "";
}

function getEnum(prop) {
  let values = null;

  if (prop.type?.elements) {
    values = prop.type.elements.map((item) => item.name.replaceAll('"', ""));
  }

  if (prop.values) {
    values = prop.values;
  }

  return values ? { enum: values } : {};
}

function getType(prop) {
  return prop.type?.name ?? "any";
}

async function extractInformation(absolutePath, config) {
  const doc = await parse(absolutePath, config.apiOptions);
  const name = doc.name || doc.displayName;
  let description = doc.description?.trim() ?? "";

  const defaultConfigFileName = getDefaultConfigFileName(absolutePath);
  let defaultConfig = {};

  if (defaultConfigFileName) {
    const defaultConfigPath = path.join(path.dirname(absolutePath), defaultConfigFileName);
    const defaultConfigContent = await readFile(defaultConfigPath, { encoding: "utf-8" });

    defaultConfig = getDefaultConfigJson(defaultConfigContent);
  }

  const globalConfigComponents = vuelessConfig?.component || {};

  const defaults = _.merge(
    defaultConfig?.defaults || {},
    globalConfigComponents[name]?.defaults || {},
  );

  doc.docsBlocks?.forEach((block) => {
    if (description.length > 0) {
      if (config.descriptionMarkup === "html") {
        description += "<br/><br/>";
      } else {
        description += "\n\n";
      }
    }

    description += block;
  });

  const componentPath = ensureRelative(path.relative(config.cwd, absolutePath));
  // Prevent "Chose declaration" duplication issue in Intellij
  const source = !componentPath.includes("vueless")
    ? { source: { module: componentPath, symbol: doc.exportName } }
    : {};

  return {
    tags: [
      {
        name,
        description,
        attributes: doc.props?.map((prop) => ({
          name: prop.name,
          required: prop.required,
          description: prop.tags?.ignore ? "@ignore: " + prop.description : prop.description,
          ...getEnum(prop),
          value: {
            kind: "expression",
            type: getType(prop),
          },
          default:
            defaults && prop.name in defaults
              ? defaults[prop.name]?.toString()
              : prop.defaultValue?.value?.toString(),
        })),
        events: doc.events?.map((event) => ({
          name: event.name,
          description: event.description,
          properties: event.properties?.map((property) => ({
            type: property.type?.names,
            name: property.name,
            description: property.description,
          })),
        })),
        slots: doc.slots?.map((slot) => ({
          name: slot.name,
          scoped: slot.scoped,
          description: slot.description,
          bindings: slot.bindings?.map((binding) => ({
            type: binding.type?.name,
            name: binding.name,
            description: binding.description,
          })),
        })),
        exposes: doc.expose?.map((expose) => ({
          name: expose.name,
          description: expose.description,
          properties: expose.tags?.map((property) => ({
            type: property.type?.name,
            name: property.name,
            description: property.description,
          })),
        })),
        ...source,
      },
    ],
  };
}
