/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          sgmm: {
            50: '#EEEEFF',
            100: '#E0E0F5',
            200: '#C5C5EB',
            300: '#A9A9E1',
            400: '#8D8DD8',
            500: '#6767c4',
            600: '#5354AC',
            700: '#424394',
            800: '#32337C',
            900: '#222264',
          }
        }
      },
    },
    plugins: [],
  };
  