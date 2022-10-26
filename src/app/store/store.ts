import {configureStore, ConfigureStoreOptions, combineReducers} from '@reduxjs/toolkit';
import appReducer from './appSlice';
import {createContext} from "react";
import {ReactReduxContextValue} from "react-redux";

export const appReducers = combineReducers({app: appReducer})
export const appOpts:  ConfigureStoreOptions = {
  reducer: appReducers,
}
const store = configureStore(appOpts);

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof appReducers>;

export const store1Context = createContext<ReactReduxContextValue>(null as any);
export default store;
