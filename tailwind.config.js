/** ============================================================
 *  Solaise.AI — Tailwind config
 *  Tokens backed by CSS variables from src/styles/solaise/tokens.css
 *  ============================================================ */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:     { 50:"var(--gold-50)",100:"var(--gold-100)",200:"var(--gold-200)",300:"var(--gold-300)",400:"var(--gold-400)",500:"var(--gold-500)",600:"var(--gold-600)",700:"var(--gold-700)",800:"var(--gold-800)" },
        navy:     { 300:"var(--navy-300)",400:"var(--navy-400)",500:"var(--navy-500)",600:"var(--navy-600)",700:"var(--navy-700)",800:"var(--navy-800)",900:"var(--navy-900)",950:"var(--navy-950)" },
        obsidian: { 500:"var(--obsidian-500)",600:"var(--obsidian-600)",700:"var(--obsidian-700)",750:"var(--obsidian-750)",800:"var(--obsidian-800)",850:"var(--obsidian-850)",900:"var(--obsidian-900)",950:"var(--obsidian-950)" },
        ivory:    { 50:"var(--ivory-50)",100:"var(--ivory-100)",200:"var(--ivory-200)",300:"var(--ivory-300)",400:"var(--ivory-400)" },
        platinum: { 100:"var(--platinum-100)",200:"var(--platinum-200)",400:"var(--platinum-400)",600:"var(--platinum-600)" },
        taupe:    { 300:"var(--taupe-300)",400:"var(--taupe-400)",500:"var(--taupe-500)",600:"var(--taupe-600)" },
        success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)", info: "var(--info)",
        surface: {
          DEFAULT:"var(--surface-base)", base:"var(--surface-base)", sunken:"var(--surface-sunken)",
          card:"var(--surface-card)", raised:"var(--surface-raised)", overlay:"var(--surface-overlay)",
          inverse:"var(--surface-inverse)", gold:"var(--surface-gold)",
        },
        content: {
          DEFAULT:"var(--text-primary)", primary:"var(--text-primary)", secondary:"var(--text-secondary)",
          muted:"var(--text-muted)", inverse:"var(--text-inverse)", gold:"var(--text-gold)",
          link:"var(--text-link)", "on-gold":"var(--text-on-gold)",
        },
        accent: { DEFAULT:"var(--accent)", hover:"var(--accent-hover)", press:"var(--accent-press)", navy:"var(--accent-navy)" },
        border: {
          subtle:"var(--border-subtle)", DEFAULT:"var(--border-default)",
          strong:"var(--border-strong)", gold:"var(--border-gold)",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Times New Roman", "serif"],
        serif:   ["Cormorant Garamond", "Georgia", "serif"],
        sans:    ["Jost", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontSize: {
        "2xs":"var(--text-2xs)", xs:"var(--text-xs)", sm:"var(--text-sm)", base:"var(--text-base)",
        md:"var(--text-md)", lg:"var(--text-lg)", xl:"var(--text-xl)",
        "2xl":"var(--text-2xl)", "3xl":"var(--text-3xl)", "4xl":"var(--text-4xl)", "5xl":"var(--text-5xl)",
      },
      fontWeight: {
        light:"var(--weight-light)", normal:"var(--weight-regular)", medium:"var(--weight-medium)",
        semibold:"var(--weight-semibold)", bold:"var(--weight-bold)",
      },
      lineHeight: {
        tight:"var(--leading-tight)", snug:"var(--leading-snug)",
        normal:"var(--leading-normal)", relaxed:"var(--leading-relaxed)",
      },
      letterSpacing: {
        tightest:"var(--tracking-tightest)", tight:"var(--tracking-tight)", normal:"var(--tracking-normal)",
        wide:"var(--tracking-wide)", wider:"var(--tracking-wider)", widest:"var(--tracking-widest)",
      },
      spacing: {
        0:"var(--space-0)", 1:"var(--space-1)", 2:"var(--space-2)", 3:"var(--space-3)", 4:"var(--space-4)",
        5:"var(--space-5)", 6:"var(--space-6)", 7:"var(--space-7)", 8:"var(--space-8)",
        9:"var(--space-9)", 10:"var(--space-10)", 11:"var(--space-11)",
        "control-sm":"var(--control-sm)", "control-md":"var(--control-md)", "control-lg":"var(--control-lg)",
      },
      borderRadius: {
        xs:"var(--radius-xs)", sm:"var(--radius-sm)", md:"var(--radius-md)", lg:"var(--radius-lg)",
        xl:"var(--radius-xl)", "2xl":"var(--radius-2xl)", pill:"var(--radius-pill)", circle:"var(--radius-circle)",
      },
      maxWidth: { container:"var(--container-max)", wide:"var(--container-wide)" },
      boxShadow: {
        xs:"var(--shadow-xs)", sm:"var(--shadow-sm)", md:"var(--shadow-md)", lg:"var(--shadow-lg)", xl:"var(--shadow-xl)",
        "rim-soft":"var(--rim-soft)", "rim-gold":"var(--rim-gold)",
        "glow-gold-sm":"var(--glow-gold-sm)", "glow-gold-md":"var(--glow-gold-md)",
        card:"var(--shadow-md), var(--rim-soft)", pop:"var(--shadow-lg), var(--rim-soft)",
      },
      backgroundImage: {
        "gold-gradient":"var(--gold-gradient)",
        "gold-gradient-soft":"var(--gold-gradient-soft)",
        "gold-sheen":"var(--gold-sheen)",
      },
      backdropBlur: { sm:"8px", md:"18px", lg:"32px" },
      transitionTimingFunction: { lux:"var(--ease-lux)", soft:"var(--ease-soft)" },
      transitionDuration: { fast:"140ms", mid:"260ms", slow:"520ms" },
    },
  },
  plugins: [],
};
