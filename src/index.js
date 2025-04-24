import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18
import { Provider } from 'react-redux';
import App from './App';
import { store } from './redux/store';
import Modal from 'react-modal';

// Set the app element globally for accessibility (for react-modal)
Modal.setAppElement('#root');  // '#root' is the ID of the root element

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
