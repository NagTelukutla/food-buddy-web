import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryLocationProvider } from './context/DeliveryLocationContext';
import './index.css';

const glassToastBase = {
  maxWidth: 'min(92vw, 22rem)',
  padding: '0.75rem 1rem',
  textAlign: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DeliveryLocationProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-center"
              containerClassName="!top-[calc(var(--app-header-height)+0.75rem)]"
              gutter={10}
              toastOptions={{
                duration: 3200,
                className: 'glass-toast',
                style: glassToastBase,
                success: {
                  className: 'glass-toast glass-toast-success',
                  style: glassToastBase,
                  iconTheme: {
                    primary: '#16a34a',
                    secondary: '#f0fdf4',
                  },
                },
                error: {
                  className: 'glass-toast glass-toast-error',
                  style: glassToastBase,
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#fef2f2',
                  },
                },
                loading: {
                  className: 'glass-toast glass-toast-loading',
                  style: glassToastBase,
                  iconTheme: {
                    primary: '#ea580c',
                    secondary: '#fff7ed',
                  },
                },
              }}
            />
        </CartProvider>
        </DeliveryLocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
