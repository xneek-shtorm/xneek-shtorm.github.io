import {createSlice} from '@reduxjs/toolkit';
import { AppState } from '../../app/store/store';

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};


const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },

});

export const { increment, decrement } = counterSlice.actions;

export default counterSlice.reducer;
