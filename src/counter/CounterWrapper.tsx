import React from 'react';

import {Provider} from "react-redux";
import Counter from "./Counter";
import {configureStore} from "@reduxjs/toolkit";
import {conf, store2Context} from "./store/store";

export const CounterWrapper = React.memo(({id, onDelete }: {id: number; onDelete(x: number): void}) => {
    const store = configureStore(conf);
  return (
      <Provider store={store} context={store2Context}>
        <Counter id={id} onDelete={(x) => onDelete(x)} />
      </Provider>
  );
})
