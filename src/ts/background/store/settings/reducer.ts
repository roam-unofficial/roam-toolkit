import { Reducer } from 'redux';
import { SettingsActions } from './actions';
import { ThemeTypes } from './../../../components/styles/themes';

export interface IAppSettings {
	theme: ThemeTypes;
}

const initialState: IAppSettings = {
	theme: 'light'
};

const settings: Reducer<IAppSettings, SettingsActions> = (state = initialState, action) => {
	switch (action.type) {
		case 'DARK_THEME':
			return { ...state, theme: 'dark' };
		
		case 'LIGHT_THEME':
			return { ...state, theme: 'light' };

		default:
			return state;
	}
};

export default settings;