/** @type {import('tailwindcss').Config} */
import { vuelessContent, vuelessContentVue, vuelessPreset } from "vueless/preset-tailwind";

export default {
  content: [...vuelessContent, ...vuelessContentVue, "./.storybook/**/*.{js,ts,jsx,tsx,html}"],
  presets: [vuelessPreset],
  theme: {
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
    },
  },
};
