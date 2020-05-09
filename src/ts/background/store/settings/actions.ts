import { Action } from 'redux';

export type SettingActionTypes = 'RETURN_TO_HOME' | 'SET_FEATURE_ID';
export type SettingsActions =
    | Action<SettingActionTypes, string>
    | Action<SettingActionTypes>;

export const returnToHome = () => ({ type: 'RETURN_TO_HOME' });
export const setFeatureId = (payload: string = '') => ({
    type: 'SET_FEATURE_ID',
    payload,
});
