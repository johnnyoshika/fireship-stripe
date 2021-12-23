import { stripe } from './';
import Stripe from 'stripe';

const webhookHandlers = {
  'checkout.session.completed': async (data: Stripe.Event.Data) => {},
  'payment_intent.succeeded': async (
    data: Stripe.PaymentIntent,
  ) => {},
  'payment_intent.payment_failed': async (
    data: Stripe.PaymentIntent,
  ) => {},
  'customer.subscription.deleted': async (
    data: Stripe.Subscription,
  ) => {},
  'customer.subscription.created': async (
    data: Stripe.Subscription,
  ) => {},
  'invoice.payment_succeeded': async (data: Stripe.Invoice) => {},
  'invoice.payment_failed': async (data: Stripe.Invoice) => {},
};

export const handleStripeWebhook = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req['rawBody'],
    sig,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
  try {
    await webhookHandlers[event.type](event.data.object);
    res.send({ received: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : error;
    res.status(400).send(`Webhook Error: ${message}`);
  }
};
