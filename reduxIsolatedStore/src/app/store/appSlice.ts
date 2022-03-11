import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { AppState } from './store';

export interface AppStateT {
  counters: number[];
}

const initialState: AppStateT = {
  counters: [1, 11111111111111],
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    add: (state, { payload }) => {
      state.counters.push(payload);
    },
    remove: (state, { payload }) => {
      state.counters = state.counters.filter(x => x !== payload);
    },
  },

});

export const { add, remove } = appSlice.actions;

export const selectAppCounters = (state: AppState) => state.app.counters;

export default appSlice.reducer;
