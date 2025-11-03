/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference types="vite/client" />
/// <reference types="vueless/modules" />

declare module "@vueless/storybook" {
  import type { UnknownObject } from "vueless";

  export function getThemeDark(theme: UnknownObject): UnknownObject;
  export function getThemeLight(theme: UnknownObject): UnknownObject;
  export function getThemeLightPreview(theme: UnknownObject): UnknownObject;

  export function vue3SourceDecorator(): Promise<UnknownObject>;
  export function storyDarkModeDecorator(): Promise<UnknownObject>;

  export function defineConfigWithVueless(options?: UnknownObject): () => UnknownObject;
  export function getVuelessStoriesGlob(vuelessEnv?: string): Promise<string[]>;
}
