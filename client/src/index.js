import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import userStore from './store/userStore';

export const Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<Context.Provider value={{ user: new userStore() }}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Context.Provider>
	</React.StrictMode>
);
