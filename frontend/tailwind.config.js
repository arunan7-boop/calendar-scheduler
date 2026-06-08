export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--brand-primary, #6366f1)',
        secondary: 'var(--brand-secondary, #ec4899)',
      }
    }
  },
  plugins: []
};
