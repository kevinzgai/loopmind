/*
 * @Author: neno 605899155@qq.com
 * @Date: 2026-01-28 20:42:55
 * @LastEditors: neno 605899155@qq.com
 * @LastEditTime: 2026-01-30 22:48:40
 * @FilePath: /chart-ai/frontend/tailwind.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Future Purple Theme Mapping
        purple: {
          50: "hsl(var(--muted))",      /* #faf5ff */
          100: "#f3e8ff",               /* Derived */
          200: "hsl(var(--purple-5))",  /* #ddd6fe */
          300: "hsl(var(--purple-4))",  /* #c4b5fd */
          400: "hsl(var(--purple-3))",  /* #a78bfa */
          500: "hsl(var(--purple-2))",  /* #8b5cf6 */
          600: "hsl(var(--purple-1))",  /* #7c3aed */
          700: "#6d28d9",               /* Derived */
          800: "#5b21b6",               /* Derived */
          900: "#4c1d95",               /* Derived */
          950: "#2e1065",               /* Derived */
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
