import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store, {store1Context} from './app/store/store';
import App from './app/App';
import './styles.css';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store} context={store1Context}>
      <App />
    </Provider>
  </React.StrictMode>
);
