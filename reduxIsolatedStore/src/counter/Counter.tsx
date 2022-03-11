import React from 'react';

import {
  decrement,
  increment,
} from './store/counterSlice';
import {useCounterDispatch, useCounterSelector} from "./store/hooks";

const Counter = ({id, onDelete}: {id: number;onDelete(id: number): void}) => {
  const count = useCounterSelector((state) => state.counter.value);

  const dispatch = useCounterDispatch();

  return (
      <fieldset>
          <legend>Counter from {new Date(id).toLocaleString()}</legend>
          <button onClick={() => dispatch(decrement())}>-</button>
          <span className="cou" style={{ color: `rgba(${count * 10}, ${255 - (count * 10)}, 0)` }}>{count}</span>
          <button onClick={() => dispatch(increment())}>+</button>
          <button onClick={() => onDelete(id)} className="del">×</button>
      </fieldset>
  );
}

export default Counter;
