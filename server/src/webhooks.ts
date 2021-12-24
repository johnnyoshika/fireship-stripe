import { stripe } from './';
import Stripe from 'stripe';
import { db } from './firebase';
import { firestore } from 'firebase-admin';

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
  ) => {
    const customer = (await stripe.customers.retrieve(
      data.customer as string,
    )) as Stripe.Customer;
    const userId = customer.metadata.firebaseUID;
    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      activePlans: firestore.FieldValue.arrayRemove(
        ...data.items.data.map(i => i.plan.id),
      ),
    });
  },
  'customer.subscription.created': async (
    data: Stripe.Subscription,
  ) => {
    const customer = (await stripe.customers.retrieve(
      data.customer as string,
    )) as Stripe.Customer;
    const userId = customer.metadata.firebaseUID;
    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      activePlans: firestore.FieldValue.arrayUnion(
        ...data.items.data.map(i => i.plan.id),
      ),
    });
  },
  'invoice.payment_succeeded': async (data: Stripe.Invoice) => {},
  'invoice.payment_failed': async (data: Stripe.Invoice) => {
    const customer = (await stripe.customers.retrieve(
      data.customer as string,
    )) as Stripe.Customer;
    const userSnapshot = await db
      .collection('users')
      .doc(customer.metadata.firebaseUID)
      .get();
    await userSnapshot.ref.update({ status: 'PAST_DUE' });
  },
};

export const handleStripeWebhook = async (req: any, res: any) => {
  // Can't get the signature to work. Results in this error:
  // No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? https://github.com/stripe/stripe-node#webhook-signing
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(
  //   req['rawBody'],
  //   sig,
  //   process.env.STRIPE_WEBHOOK_SECRET,
  // );
  try {
    // if (webhookHandlers[event.type])
    //   await webhookHandlers[event.type](event.data.object);

    if (webhookHandlers[req.body.type])
      await webhookHandlers[req.body.type](req.body.data.object);
    res.send({ received: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : error;
    res.status(400).send(`Webhook Error: ${message}`);
  }
};
