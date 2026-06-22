/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface)',
          subtle: 'var(--color-bg-subtle)',
          muted: 'var(--color-bg-muted)',
          overlay: 'var(--color-bg-overlay)',
        },
        game: {
          field: 'var(--color-game-field)',
          grid: 'var(--color-game-grid)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          active: 'var(--color-accent-active)',
          soft: 'var(--color-accent-soft)',
          text: 'var(--color-accent-text)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          soft: 'var(--color-info-soft)',
          text: 'var(--color-info-text)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
          text: 'var(--color-success-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
          text: 'var(--color-warning-text)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          soft: 'var(--color-danger-soft)',
          text: 'var(--color-danger-text)',
        },
        snake: {
          you: 'var(--color-snake-you)',
          1: 'var(--color-snake-1)',
          2: 'var(--color-snake-2)',
          3: 'var(--color-snake-3)',
          4: 'var(--color-snake-4)',
          5: 'var(--color-snake-5)',
        },
        food: 'var(--color-food)',
        focus: {
          ring: 'var(--color-focus-ring)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
}
