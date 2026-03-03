import type { Theme } from '../types'

export const darkTheme: Theme = {
  name: 'dark',
  label: '深色科技',
  colors: {
    primary: '#00d4ff',
    primaryLight: '#4de8ff',
    primaryDark: '#00a8cc',
    secondary: '#7c3aed',
    secondaryLight: '#a78bfa',
    secondaryDark: '#5b21b6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    bgPrimary: '#0a0e27',
    bgSecondary: '#151b3d',
    bgTertiary: '#1e2447',
    bgElevated: '#252b4e',
    textPrimary: '#ffffff',
    textSecondary: '#b4b9d4',
    textTertiary: '#6b7194',
    textDisabled: '#3d4266'
  }
}

export const lightTheme: Theme = {
  name: 'light',
  label: '浅色简约',
  colors: {
    primary: '#1890ff',
    primaryLight: '#40a9ff',
    primaryDark: '#096dd9',
    secondary: '#722ed1',
    secondaryLight: '#9254de',
    secondaryDark: '#531dab',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    info: '#1890ff',
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#fafafa',
    bgElevated: '#e8e8e8',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textDisabled: '#c0c0c0'
  }
}
