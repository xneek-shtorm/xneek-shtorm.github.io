import {combineReducers, configureStore, ConfigureStoreOptions} from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import {createContext} from "react";
import {ReactReduxContextValue} from "react-redux";
const reducers = combineReducers({ counter: counterReducer })

export const conf:  ConfigureStoreOptions = {
  reducer: reducers,
}

const store = configureStore(conf);

export type CounterDispatch = typeof store.dispatch;
export type CounterState = ReturnType<typeof reducers>;
export const store2Context = createContext<ReactReduxContextValue>(null as any);

