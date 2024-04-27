import type { Config } from "tailwindcss";
import { blueGrey, cyan, teal,amber,yellow,red,green ,indigo,grey,brown,deepOrange,deepPurple,pink} from '@mui/material/colors'


const config: Config = {
  darkMode: 'class',
  purge:{
    enabled: true,
    content: ['./**/*.tsx'],
    options: {
      safelist: ['dark'], //specific classes
    },
  },
  content: [
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    //@ts-expect-error
    typography: (theme) => ({}),
    extend: {
      //@ts-expect-error
      typography: (theme) => ({
        dark: {
          css: {
            color: 'white',
          },
        },
      }),
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  variants: {
    typography: ['dark'],
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
