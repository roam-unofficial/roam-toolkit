import {DefaultTheme} from 'styled-components'

export type ThemeTypes = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
    backgroundColor: '#fff',
}

export const darkTheme: DefaultTheme = {
    backgroundColor: '#181818',
}

export const themes = {
    light: lightTheme,
    dark: darkTheme,
}
