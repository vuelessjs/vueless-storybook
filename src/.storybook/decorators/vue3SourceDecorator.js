import { addons, makeDecorator, useArgs } from "storybook/preview-api";
import { SNIPPET_RENDERED } from "storybook/internal/docs-tools";
import { h, onMounted, watch } from "vue";

const params = new URLSearchParams(window.location.search);
let previousStoryId = null;
let previousArgs = {};

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
    const channel = addons.getChannel();

    previousStoryId = context.id;

    // this returns a new component that computes the source code when mounted
    // and emits an event that is handled by addons-docs
    // watch args and re-emit on change
    return {
      components: { story },
      setup() {
        onMounted(async () => {
          updateArgs({ ...context.args, ...urlArgs });

          /* override default code snippet by optimized ones */
          setTimeout(setSourceCode, 500);

          /* rerender code snippet by optimized ones */
          channel.on(SNIPPET_RENDERED, async (payload) => {
            if (payload.source.includes(`<script lang="ts" setup>`)) {
              await setSourceCode();
            }
          });
        });

        watch(
          context.args,
          async (newArgs) => {
            if (JSON.stringify(previousArgs) === JSON.stringify(newArgs)) return;

            previousArgs = { ...newArgs };
            updateArgs({ ...context.args });

            await setSourceCode();
          },
          { deep: true },
        );

        async function setSourceCode() {
          try {
            const src = context.originalStoryFn(context.args, context.argTypes).template;
            const code = preFormat(src, context.args, context.argTypes);

            const emitFormattedTemplate = async () => {
              const prettier = await import("prettier2");
              const prettierHtml = await import("prettier2/parser-html");

              const formattedCode = prettier.format(code, {
                parser: "html",
                plugins: [prettierHtml],
                htmlWhitespaceSensitivity: "ignore",
              });

              // emits an event when the transformation is completed and content rendered
              channel.emit(SNIPPET_RENDERED, {
                id: context.id,
                args: context.args,
                source: postFormat(formattedCode),
              });
            };

            await emitFormattedTemplate();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Failed to render code", e);
          }
        }

        const storyClasses = context.parameters?.storyClasses || "px-6 pt-8 pb-12";

        return () => h("div", { class: storyClasses }, [h(story)]);
      },
    };
  },
});

function getModelValue(value) {
  if (value === undefined) return "";

  return isPrimitive(value)
    ? JSON.stringify(value)?.replaceAll('"', "")
    : JSON.stringify(value).replaceAll('"', "'");
}

function preFormat(templateSource, args, argTypes) {
  templateSource = expandVueLoopFromTemplate(templateSource, args, argTypes);

  if (args?.outerEnum) {
    templateSource = expandOuterVueLoopFromTemplate(templateSource, args, argTypes);
  }

  const componentArgs = {
    ...(args.class && { class: args.class }),
  };

  const enumKeys = Object.entries(args)
    .filter(([, value]) => JSON.stringify(value)?.includes("{enumValue}"))
    .map(([key]) => key);

  for (const [key, val] of Object.entries(argTypes)) {
    if (key === "modelValue") continue;

    const isUndefined = typeof val !== "undefined";
    const isProps = val?.table?.category === "props";
    const isValueDefault = args[key] === val.defaultValue;

    if (isUndefined && isProps && !isValueDefault) {
      if (!(args.enum && enumKeys.includes(key)) && key !== args.outerEnum) {
        componentArgs[key] = val;
      }
    }
  }

  const slotTemplateCodeBefore =
    // eslint-disable-next-line vue/max-len
    `<template v-for="(slot, index) of slots" :key="index" v-slot:[slot]><template v-if="slot === 'default' && !args['defaultSlot']">`;

  const slotTemplateCodeAfter =
    // eslint-disable-next-line vue/max-len
    `</template><template v-else-if="slot === 'default' && args['defaultSlot']">{{ args['defaultSlot'] }}</template><template v-else-if="args[slot + 'Slot']">{{ args[slot + 'Slot'] }}</template></template>`;

  const modelValue = getModelValue(args["modelValue"]);

  templateSource = templateSource
    .replace(/>[\s]+</g, "><")
    .trim()
    .replace(slotTemplateCodeBefore, "")
    .replace(slotTemplateCodeAfter, "")
    .replace(
      new RegExp(`v-model="args\\.modelValue"`, "g"),
      args["modelValue"] ? `v-model="${modelValue}"` : "",
    )
    .replace(/v-model:(\w+)="args\.(\w+)"/g, (_, modelKey, argKey) => {
      const value = args[argKey];
      const formattedVal = getModelValue(value);

      return formattedVal ? `v-model:${modelKey}="${formattedVal}"` : "";
    })
    .replace(
      /v-bind="args"/g,
      Object.keys(componentArgs)
        .map((key) => " " + propToSource(kebabCase(key), args[key], argTypes[key]))
        .join(""),
    )
    .replace(/:class="args\.wrapperClass"/g, `class="${args.wrapperClass}"`);

  return templateSource;
}

function postFormat(code) {
  return (
    code
      /* Add self-closing tag if there is no content inside */
      .replace(/<(\w+)([^>]*)><\/\1>/g, (_, tag, attrs) => {
        const hasText = attrs.trim().includes("\n") ? false : attrs.trim().length > 0;
        const space = hasText ? " " : "";

        return `<${tag}${attrs}${space}/>`;
      })
      /* Format objects in props */
      .replace(/^(\s*):([\w-]+)="\[(\{.*?\})\]"/gm, (_, indent, propName, content) => {
        const formatted = content
          .split(/\},\s*\{/)
          .map((obj, i, arr) => {
            if (i === 0) obj += "}";
            else if (i === arr.length - 1) obj = "{" + obj;
            else obj = "{" + obj + "}";

            return `${indent}  ${obj}`;
          })
          .join(",\n");

        return `${indent}:${propName}="[\n${formatted}\n${indent}]"`;
      })
      /* Added a new line between nested elements with closing tags */
      .replace(/(<\/[\w-]+>)\n(\s*)(<[\w-][^>]*?>)/g, (match, closeTag, indent, openTag) => {
        return `${closeTag}\n\n${indent}${openTag}`;
      })
      /* Added a new line between nested elements with self-closing tags */
      .replace(/(\/>\n)(?=\s*<\w[\s\S]*?\n\s*\/>)/g, "$1\n")
  );
}

function expandOuterVueLoopFromTemplate(template, args, argTypes) {
  const loopRegex = /<(\w+)[^>]*v-for[^>]*>([\s\S]*?)<\/\1>/;
  const loopMatch = template.match(loopRegex);

  if (!loopMatch) return;

  const [, containerTag, innerContent] = loopMatch;

  const elementRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/g;
  const elements = [...innerContent.matchAll(elementRegex)];

  if (!elements.length) return;

  const newRows = argTypes[args.outerEnum]?.options
    .map((variant) => {
      const rows = elements
        .map(([, tag, props, children]) => {
          return `<${tag}${props} ${args.outerEnum}="${variant}">${children}</${tag}>`;
        })
        .join("\n    ");

      return `  <${containerTag}>\n    ${rows}\n  </${containerTag}>`;
    })
    .join("\n");

  return template.replace(loopRegex, newRows);
}

function expandVueLoopFromTemplate(template, args, argTypes) {
  return template.replace(
    // eslint-disable-next-line vue/max-len
    /<(\w+)([^>]*)\s+v-for="option\s+in\s+argTypes\?\.\[args\.enum]\?\.options"([^>]*?)>([\s\S]*?)<\/\1\s*>|<(\w+)([^>]*)\s+v-for="option\s+in\s+argTypes\?\.\[args\.enum]\?\.options"([^>]*)\/?>/g,
    (
      match,
      name1,
      pre1,
      post1,
      content, // For full component
      name2,
      pre2,
      post2, // For self-closing component
    ) => {
      const componentName = name1 || name2;
      const beforeAttrs = pre1 || pre2 || "";
      const afterAttrs = post1 || post2 || "";
      const slotContent = content || "";

      const restProps = (beforeAttrs + " " + afterAttrs)
        .replace(/\n/g, " ") // remove newlines
        .replace(/\//g, "") // remove forward slashes
        .replace(/\sv-bind="[^"]*"/g, ' v-bind="args"') // replace v-bind with args
        .replace(/\s:key="[^"]*"/g, "") // remove :key
        .replace(/\sv-model="[^"]*"/g, "") // remove v-model
        .replace(/\s+/g, " ") // collapse multiple spaces
        .trim();

      return (
        argTypes?.[args.enum]?.options
          ?.map(
            (option) =>
              // eslint-disable-next-line vue/max-len
              `<${componentName} ${generateEnumAttributes(args, option)} ${restProps}>${slotContent}</${componentName}>`,
          )
          ?.join("\n") || ""
      );
    },
  );
}

function generateEnumAttributes(args, option) {
  const enumKeys = Object.entries(args)
    .filter(([, value]) => JSON.stringify(value)?.includes("{enumValue}"))
    .map(([key]) => key);

  if (args.enum) {
    enumKeys.unshift(args.enum);
  }

  return enumKeys
    .map((key) => {
      return key in args && !isPrimitive(args[key])
        ? `${key}="${JSON.stringify(args[key]).replaceAll('"', "'").replaceAll("{enumValue}", option)}"`
        : `${key}="${option}"`;
    })
    .join(" ");
}

function isPrimitive(value) {
  return !(value && (typeof value === "object" || Array.isArray(value)));
}

function propToSource(key, val, argType) {
  const defaultValue = argType.table?.defaultValue?.summary;
  const type = typeof val;

  switch (type) {
    case "boolean":
      return val || defaultValue === "false" ? key : `:${key}="${val}"`;
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
