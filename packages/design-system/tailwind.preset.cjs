/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ross: {
          navy: { 950:'#03101F',900:'#071A33',800:'#0B294D',700:'#123D6A' },
          gold: { 600:'#A98214',500:'#C9A227',400:'#E0BE4F' },
          mist:'#F4F7FA', slate:'#52606D', success:'#137A52', warning:'#A35B00', danger:'#B42318', info:'#175CD3'
        }
      },
      fontFamily: {
        sans:['Inter','ui-sans-serif','system-ui','sans-serif'],
        mono:['JetBrains Mono','ui-monospace','monospace']
      },
      boxShadow: {
        'ross-sm':'0 1px 2px rgb(16 24 40 / .08)',
        'ross-md':'0 8px 24px rgb(7 26 51 / .12)',
        'ross-lg':'0 20px 45px rgb(7 26 51 / .18)'
      }
    }
  },
  plugins: []
};
