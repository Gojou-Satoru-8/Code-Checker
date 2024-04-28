/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./views/**/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ["cupcake", "nord", "dark", "emerald", "forest", "dracula", "night", "synthwave"],
    darkTheme: "night",
  },
};
