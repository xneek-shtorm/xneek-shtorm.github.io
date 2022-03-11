import React from 'react';
import {CounterWrapper} from "../counter/CounterWrapper";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {add, remove, selectAppCounters} from "./store/appSlice";


function App() {
    const countersIds = useAppSelector(selectAppCounters);
    const dispatch = useAppDispatch();

    const handleDel = React.useCallback((delId: number) => dispatch(remove(delId)), [])
      return (
        <div>
            <button onClick={() => dispatch(add(new Date().getTime()))}>Add</button>
            {countersIds.map(id => <CounterWrapper id={id} key={id} onDelete={handleDel} />)}
        </div>
      );
}

export default App;
