import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FirebaseAppProvider } from 'reactfire';
import { firebaseConfig } from './firebase';
import { Elements } from '@stripe/react-stripe-js';

// In order to be PCI compliant, we must load the latest JS from Stripe.
// loadStripe will add a script tag to the head of the document.
import { loadStripe } from '@stripe/stripe-js';

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  throw new Error(
    'REACT_APP_STRIPE_PUBLISHABLE_KEY env variable missing.',
  );

export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
);

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
