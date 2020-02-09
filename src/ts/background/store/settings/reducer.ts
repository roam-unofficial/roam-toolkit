import { Reducer } from 'redux';
import { ThemeTypes } from './../../../components/styles/themes';
import { SettingsActions } from './actions';

export interface IAppSettings {
    theme: ThemeTypes;
    featureId: string;
}

const initialState: IAppSettings = {
    theme: 'light',
    featureId: ''
};

const settings: Reducer<IAppSettings, SettingsActions> = (state = initialState, action) => {
    const { payload } = action;
    switch (action.type) {
        case 'DARK_THEME':
            return { ...state, theme: 'dark' };

        case 'LIGHT_THEME':
            return { ...state, theme: 'light' };

        case 'RETURN_TO_HOME':
            return { ...state, featureId: '' };

        case 'SET_FEATURE_ID':
            return { ...state, featureId: payload };

        default:
            return state;
    }
};

export default settings;
