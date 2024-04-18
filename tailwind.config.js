/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./views/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ["light", "dark", "cupcake", "emerald", "forest", "dracula", "night"],
    darkTheme: "night",
  },
};
