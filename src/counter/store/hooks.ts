import {createDispatchHook, createSelectorHook, TypedUseSelectorHook} from 'react-redux';
import {CounterDispatch, CounterState, store2Context} from "./store";


export const useStore2Dispatch = createDispatchHook(store2Context);
export const useStore2Selector = createSelectorHook(store2Context);
export const useCounterDispatch = () => useStore2Dispatch<CounterDispatch>();
export const useCounterSelector: TypedUseSelectorHook<CounterState> = useStore2Selector;