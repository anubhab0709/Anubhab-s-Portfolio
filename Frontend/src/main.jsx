import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PortfolioContentProvider } from './context/contentContext';
import './styles/base.css';
import './styles/portfolio.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<PortfolioContentProvider>
		<App />
	</PortfolioContentProvider>
);
