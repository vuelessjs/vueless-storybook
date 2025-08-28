import { UnknownObject } from "vueless";

export { storyDarkModeDecorator } from "./decorators/storyDarkModeDecorator";
export { vue3SourceDecorator } from "./decorators/vue3SourceDecorator";

export declare function defineConfigWithVueless(options?: UnknownObject): () => UnknownObject;
export function getVuelessStoriesGlob(vuelessEnv?: string): Promise<string[]>;
