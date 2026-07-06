/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1C120C',
        'brand-bg': '#F9F4EC',
        'brand-card': '#F2EBE1',
        'brand-orange': '#C86E3C',
        'brand-gold': '#D9A752',
        'brand-green': '#425439',
        'brand-red': '#9A3A26',
        'brand-text-dark': '#2D1E15',
        'brand-text-muted': '#7D6F66',
        'brand-border': '#EFE9DE',
        'tag-bg-red': '#FDF1EC',
        'tag-text-red': '#BA5236',
        halal:    '#2D5A27',
        'halal-bg': '#D4EDDA',
      },
      fontFamily: {
        serif:  ['"Playfair Display"', 'Georgia', 'serif'],
        body:   ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
