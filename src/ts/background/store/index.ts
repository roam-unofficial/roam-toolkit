import settings, { IAppSettings } from './settings/reducer';
import { combineReducers } from "redux";
import counter, { ICounter } from './counter/reducer';

import "redux";
// Enhance the Action interface with the option of a payload. 
// While still importing the Action interface from redux.
declare module "redux" {
	export interface Action<T = any, P = any> {
		type: T;
		payload?: P;
	}
}

export interface IAppState {
	counter: ICounter;
	settings: IAppSettings;
}

const reducers = combineReducers<IAppState>({
	counter,
	settings
});

export default reducers;