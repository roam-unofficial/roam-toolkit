import { createStore } from "redux";
import reducers, { IAppState } from "./store";
import { wrapStore, Store } from "react-chrome-redux";

const store: Store<IAppState> = createStore(reducers, {});

wrapStore(store, {
	portName: 'ExPort' // Communication port between the background component and views such as browser tabs.
});
