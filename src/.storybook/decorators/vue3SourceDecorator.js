import { addons, useArgs, makeDecorator } from "@storybook/preview-api";
import { h, onMounted, watch } from "vue";

const params = new URLSearchParams(window.location.search);
let previousStoryId = null;

function getArgsFromUrl(storyId) {
  const isInIframe = params.toString().includes("globals=");
  const isSameComponent = parseInt(previousStoryId) === parseInt(storyId);

  if (isInIframe || isSameComponent || previousStoryId === null) {
    return parseKeyValuePairs(params.get("args"));
  }

  params.delete("args");

  return {};
}

export const vue3SourceDecorator = makeDecorator({
  name: "vue3SourceDecorator",
  wrapper: (storyFn, context) => {
    const story = storyFn(context);
    const [, updateArgs] = useArgs();
    const urlArgs = getArgsFromUrl(context.id);

    previousStoryId = context.id;

    // this returns a new component that computes the source code when mounted
    // and emits an events that is handled by addons-docs
    // watch args and re-emit on change
    return {
      components: { story },
      setup() {
        onMounted(async () => {
          updateArgs({ ...context.args, ...urlArgs });

          await setSourceCode();
        });

        watch(context.args, async () => {
          // it allows changing args dynamically
          updateArgs({ ...context.args });
          await setSourceCode();
        });

        async function setSourceCode() {
          try {
            const src = context.originalStoryFn(context.args, context.argTypes).template;
            const code = templateSourceCode(src, context.args, context.argTypes);
            const channel = addons.getChannel();

            const emitFormattedTemplate = async () => {
              const prettier = await import("prettier2");
              const prettierHtml = await import("prettier2/parser-html");

              const formattedCode = prettier.format(code, {
                parser: "html",
                plugins: [prettierHtml],
                htmlWhitespaceSensitivity: "ignore",
              });

              // emits an event when the transformation is completed
              channel.emit("storybook/docs/snippet-rendered", {
                id: context.id,
                args: context.args,
                source: formattedCode,
              });
            };

            await emitFormattedTemplate();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Failed to render code", e);
          }
        }

        return () => h("div", { class: "px-6 pt-8 pb-12" }, [h(story)]);
      },
    };
  },
});

function templateSourceCode(templateSource, args, argTypes) {
  const MODEL_VALUE_KEY = "modelValue";
  const componentArgs = {};

  for (const [key, val] of Object.entries(argTypes)) {
    if (key === MODEL_VALUE_KEY) continue;

    const value = args[key];

    if (
      typeof val !== "undefined" &&
      val.table &&
      val.table.category === "props" &&
      value !== val.defaultValue
    ) {
      componentArgs[key] = val;
    }
  }

  const slotTemplateCodeBefore =
    // eslint-disable-next-line vue/max-len
    `<template v-for="(slot, index) of slots" :key="index" v-slot:[slot]><template v-if="slot === 'default' && !args['defaultSlot']">`;

  const slotTemplateCodeAfter =
    // eslint-disable-next-line vue/max-len
    `</template><template v-else-if="slot === 'default' && args['defaultSlot']">{{ args['defaultSlot'] }}</template><template v-else-if="args[slot + 'Slot']">{{ args[slot + 'Slot'] }}</template></template>`;

  return templateSource
    .replace(/>[\s]+</g, "><")
    .trim()
    .replace(slotTemplateCodeBefore, "")
    .replace(slotTemplateCodeAfter, "")
    .replace(
      `v-model="args.${MODEL_VALUE_KEY}"`,
      args[MODEL_VALUE_KEY] ? `v-model="${args[MODEL_VALUE_KEY]}"` : "",
    )
    .replace(
      'v-bind="args"',
      Object.keys(componentArgs)
        .map((key) => " " + propToSource(kebabCase(key), args[key]))
        .join(""),
    );
}

function propToSource(key, val) {
  const type = typeof val;

  switch (type) {
    case "boolean":
      return val ? key : "";
    case "string":
      return `${key}="${val}"`;
    case "object":
      return `:${key}="${getObjectValue(val)}"`;
    default:
      return `:${key}="${val}"`;
  }
}

function getObjectValue(value) {
  return JSON.stringify(value).replaceAll('"', "'");
}

function kebabCase(str) {
  return str
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
}

function parseKeyValuePairs(input) {
  input = input || "";
  const result = {};

  // Split key-value pairs and parse them
  input.split(";").forEach((pair) => {
    const [rawKey, rawValue] = pair.split(":");

    if (!rawKey) return;

    let value;

    if (rawValue === "!true") {
      value = true;
    } else if (rawValue === "!false") {
      value = false;
    } else if (rawValue === "!null") {
      value = null;
    } else if (rawValue === "!undefined") {
      value = undefined;
    } else if (!isNaN(parseInt(rawValue))) {
      value = Number(rawValue);
    } else {
      value = decodeURIComponent(rawValue.replace(/\+/g, " "));
    }

    setNestedValue(result, rawKey, value);
  });

  return result;
}

// Set nested values like objects or arrays
function setNestedValue(obj, path, value) {
  const arrayItems = path.match(/\w+|\[\d+\]/g) || [];
  const keys = arrayItems.map((key) => (key.startsWith("[") ? Number(key.slice(1, -1)) : key));
  const lastKeyIndex = keys.length - 1;

  let current = obj;

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    if (index === lastKeyIndex) {
      current[key] = value;
    }

    if (index !== lastKeyIndex && !current[key]) {
      current[key] = typeof keys[index + 1] === "number" ? [] : {};
    }

    if (index !== lastKeyIndex && current[key]) {
      current = current[key];
    }
  }
}
