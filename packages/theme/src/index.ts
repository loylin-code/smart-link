import { darkTheme, lightTheme } from './themes'
import type { Theme } from './types'

export const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme
}

export const themeList = Object.values(themes)

export { darkTheme, lightTheme }
export type { Theme, ThemeColors } from './types'
