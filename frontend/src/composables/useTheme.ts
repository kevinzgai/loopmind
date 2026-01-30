import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const appliedTheme = ref<'light' | 'dark'>('light')

export function useTheme() {
  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement
    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    root.classList.remove('light', 'dark')
    root.classList.add(isDark ? 'dark' : 'light')
    appliedTheme.value = isDark ? 'dark' : 'light'
  }

  const setTheme = (t: Theme) => {
    theme.value = t
    localStorage.setItem('theme-preference', t)
    applyTheme(t)
  }

  const toggleTheme = () => {
    const nextTheme = appliedTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  onMounted(() => {
    const savedTheme = (localStorage.getItem('theme-preference') as Theme) || 'system'
    theme.value = savedTheme
    applyTheme(savedTheme)

    // Listen for system changes if theme is system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  })

  return {
    theme,
    appliedTheme,
    setTheme,
    toggleTheme
  }
}
