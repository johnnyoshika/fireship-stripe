import { useState, useEffect, Suspense, useCallback } from 'react';
import { fetchFromAPI } from './helpers';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useUser, AuthCheck } from 'reactfire';
import firebase from 'firebase/app';
import { auth, db } from './firebase';
import { SetupIntent } from '@stripe/stripe-js/types/api';

export const SignIn = () => {
  const signIn = async () => {
    const credential = await auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider(),
    );

    if (!credential.user) return;

    const { uid, email } = credential.user;
    db.collection('users').doc(uid).set({ email }, { merge: true });
  };

  return (
    <button className="btn btn-primary" onClick={signIn}>
      Sign In with Google
    </button>
  );
};

export const SignOut = ({
  user,
}: {
  user: firebase.User | undefined;
}) => {
  if (!user) return null;

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={() => auth.signOut()}
    >
      Sign Out User {user.uid}
    </button>
  );
};

const SaveCard = () => {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();

  const [setupIntent, setSetupIntent] = useState<SetupIntent>();
  const [wallet, setWallet] = useState([]);

  const getWallet = useCallback(async () => {
    if (user.data) {
      const paymentMethods = await fetchFromAPI('wallet', {
        method: 'GET',
      });
      setWallet(paymentMethods);
    }
  }, [user.data]);

  // Get the user's wallet on mount
  useEffect(() => {
    getWallet();
  }, [getWallet]);

  // Create the setup intent
  const createSetupIntent = async () => {
    const si = await fetchFromAPI('wallet');
    setSetupIntent(si);
  };

  // Handle the submission of card details
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !cardElement || !setupIntent?.client_secret)
      return;

    // Confirm Card Setup
    const { setupIntent: updatedSetupIntent, error } =
      await stripe.confirmCardSetup(setupIntent.client_secret, {
        payment_method: { card: cardElement },
      });

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      setSetupIntent(updatedSetupIntent);
      await getWallet();
      alert('Success! Card added to your wallet');
    }
  };

  return (
    <>
      <h2>Customers</h2>

      <p>
        Save credit card details for future use. Connect a Stripe
        Customer ID to a Firebase User ID.
      </p>

      <AuthCheck fallback={<SignIn />}>
        <div className="well">
          <h3>Step 1: Create a Setup Intent</h3>

          <button
            className="btn btn-success"
            onClick={createSetupIntent}
            hidden={!!setupIntent}
          >
            Attach New Credit Card
          </button>
        </div>
        <hr />

        <form
          onSubmit={handleSubmit}
          className="well"
          hidden={!setupIntent || setupIntent.status === 'succeeded'}
        >
          <h3>Step 2: Submit a Payment Method</h3>
          <p>
            Collect credit card details, then attach the payment
            source.
          </p>
          <p>
            Normal Card: <code>4242424242424242</code>
          </p>
          <p>
            3D Secure Card: <code>4000002500003155</code>
          </p>

          <hr />

          <CardElement />
          <button className="btn btn-success" type="submit">
            Attach
          </button>
        </form>

        <div className="well">
          <h3>Retrieve all Payment Sources</h3>
          <select className="form-control">
            {wallet.map((paymentSource: any) => (
              <CreditCard
                key={paymentSource.id}
                card={paymentSource.card}
              />
            ))}
          </select>
        </div>
        <div className="well">
          <SignOut user={user.data} />
        </div>
      </AuthCheck>
    </>
  );
};

const CreditCard = ({ card }: { card: any }) => {
  const { last4, brand, exp_month, exp_year } = card;
  return (
    <option>
      {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
    </option>
  );
};

export default function Customers() {
  return (
    <Suspense fallback={'loading user'}>
      <SaveCard />
    </Suspense>
  );
}
