import {createDispatchHook, createSelectorHook, TypedUseSelectorHook} from 'react-redux';
import type { AppState, AppDispatch } from './store';
import {store1Context} from "./store";

export const useStore1Dispatch = createDispatchHook(store1Context);
export const useStore1Selector = createSelectorHook(store1Context);
export const useAppDispatch = () => useStore1Dispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useStore1Selector;
