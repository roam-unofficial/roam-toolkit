import { Action } from 'redux';

export type ThemeActionTypes = 'DARK_THEME' | 'LIGHT_THEME' | 'RETURN_TO_HOME' | 'SET_FEATURE_ID';
export type SettingsActions = Action<ThemeActionTypes, string> | Action<ThemeActionTypes>;

export const setDarkTheme = () => ({ type: 'DARK_THEME' });
export const setLightTheme = () => ({ type: 'LIGHT_THEME' });
export const returnToHome = () => ({ type: 'RETURN_TO_HOME' });
export const setFeatureId = (payload: string = '') => ({ type: 'SET_FEATURE_ID', payload });