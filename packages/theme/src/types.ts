export interface ThemeColors {
  primary: string
  primaryLight: string
  primaryDark: string
  secondary: string
  secondaryLight: string
  secondaryDark: string
  success: string
  warning: string
  danger: string
  info: string
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgElevated: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textDisabled: string
}

export interface Theme {
  name: string
  label: string
  colors: ThemeColors
}
