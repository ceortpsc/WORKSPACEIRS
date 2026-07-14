/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ross: {
          navy: { 950:'#03101F',900:'#071A33',800:'#0B294D',700:'#123D6A' },
          gold: { 600:'#A98214',500:'#C9A227',400:'#E0BE4F' },
          eggshell: { 50:'#FFFAF1',100:'#FFF6E8',200:'#F8EDDB',300:'#F1E2CA',400:'#E5D2B5',500:'#D4BC98' },
          base:'#F8EDDB', surface:'#FFFAF1', elevated:'#FFFDF8',
          slate:'#52606D', success:'#137A52', warning:'#A35B00', danger:'#B42318', info:'#175CD3'
        }
      },
      fontFamily: {
        sans:['Inter','ui-sans-serif','system-ui','sans-serif'],
        mono:['JetBrains Mono','ui-monospace','monospace']
      },
      boxShadow: {
        'ross-sm':'0 1px 2px rgb(74 52 28 / .09)',
        'ross-md':'0 8px 24px rgb(74 52 28 / .13)',
        'ross-lg':'0 20px 45px rgb(74 52 28 / .18)'
      }
    }
  },
  plugins: []
};
