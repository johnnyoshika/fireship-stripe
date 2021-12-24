import { useState } from 'react';
import { fetchFromAPI } from './helpers';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { PaymentIntent } from '@stripe/stripe-js/types/api';

const Payments = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [amount, setAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();

  const createPaymentIntent = async () => {
    // Stripe's min / max are 50 / 9999999
    const validAmount = Math.min(Math.max(amount, 50), 9999999);
    setAmount(validAmount);

    const pi = await fetchFromAPI('payments', {
      body: { amount: validAmount },
    });
    setPaymentIntent(pi);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !cardElement || !paymentIntent?.client_secret)
      return;

    // Apply credit card to payment intent, then attempt to charge payment intent right away
    const { paymentIntent: updatedPaymentIntent, error } =
      await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: { card: cardElement },
      });

    if (error) {
      console.error(error);
      error.payment_intent && setPaymentIntent(error.payment_intent);
    } else {
      setPaymentIntent(updatedPaymentIntent);
    }
  };

  return (
    <>
      <h2>Payments</h2>
      <p>One-time payment scenario.</p>
      <div className="well">
        <PaymentIntentData paymentIntent={paymentIntent} />
      </div>

      <div className="well">
        <h3>Step 1: Create a Payment Intent</h3>
        <p>
          Change the amount of the payment in the form, then request a
          Payment Intent to create context for one-time payment. Min
          50, Max 9999999
        </p>

        <div className="form-inline">
          <input
            className="form-control"
            type="number"
            value={amount}
            disabled={!!paymentIntent}
            onChange={e => setAmount(parseInt(e.target.value, 10))}
          />
          <button
            className="btn btn-success"
            disabled={amount <= 0}
            onClick={createPaymentIntent}
            hidden={!!paymentIntent}
          >
            Ready to Pay ${(amount / 100).toFixed(2)}
          </button>
        </div>
      </div>
      <hr />

      <form
        onSubmit={handleSubmit}
        className="well"
        hidden={
          !paymentIntent || paymentIntent.status === 'succeeded'
        }
      >
        <h3>Step 2: Submit a Payment Method</h3>
        <p>Collect credit card details, then submit the payment.</p>
        <p>
          Normal Card: <code>4242424242424242</code>
        </p>
        <p>
          3D Secure Card: <code>4000002500003155</code>
        </p>

        <hr />

        <CardElement />
        <button className="btn btn-success" type="submit">
          Pay
        </button>
      </form>
    </>
  );
};

function PaymentIntentData({
  paymentIntent,
}: {
  paymentIntent: PaymentIntent | undefined;
}) {
  if (!paymentIntent) return <p>No payment intent</p>;

  const { id, amount, status, client_secret } = paymentIntent;
  return (
    <>
      <h3>
        Payment intent{' '}
        <span
          className={
            'badge ' +
            (status === 'succeeded'
              ? 'badge-success'
              : 'badge-secondary')
          }
        >
          {status}
        </span>
      </h3>
      <pre>
        ID: {id} <br />
        Client Secret: {client_secret} <br />
        Amount: {amount} <br />
        Status:{status}
        <br />
      </pre>
    </>
  );
}

export default Payments;
