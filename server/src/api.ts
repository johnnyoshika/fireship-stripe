import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
import { auth } from './firebase';
import { createSetupIntent, listPaymentMethods } from './customers';
import {
  cancelSubscription,
  createSubscription,
  listSubscriptions,
} from './billing';
export const app = express();

// modify express.json middle to add rawBody buffer to the request
// so that rawBody can be used to verify Stripe's webhook signed request
app.use(
  express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer),
  }),
);

app.use(cors({ origin: true }));

app.use(decodeJWT);

async function decodeJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
      req['currentUser'] = await auth.verifyIdToken(idToken);
    } catch (err) {
      console.log(err);
    }
  }

  next();
}

function validateUser(req: Request) {
  const user = req['currentUser'];
  if (!user) {
    throw new Error(
      'You must be logged in to make this request. i.e Authorization: Bearer <token>',
    );
  }

  return user;
}

function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };
}

app.post(
  '/checkouts',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(body.line_items));
  }),
);

app.post(
  '/payments',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createPaymentIntent(body.amount));
  }),
);

// Save a card on the customer record with a SetupIntent
app.post(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const setupIntent = await createSetupIntent(user.uid);
    res.send(setupIntent);
  }),
);

// Retrieve all cards attached to a customer
app.get(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const wallet = await listPaymentMethods(user.uid);
    res.send(wallet.data);
  }),
);

// Create a and charge new Subscription
app.post(
  '/subscriptions/',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = await createSubscription(
      user.uid,
      plan,
      payment_method,
    );
    res.send(subscription);
  }),
);

// Get all subscriptions for a customer
app.get(
  '/subscriptions/',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const subscriptions = await listSubscriptions(user.uid);

    res.send(subscriptions.data);
  }),
);

// Unsubscribe or cancel a subscription
app.patch(
  '/subscriptions/:id',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    res.send(await cancelSubscription(user.uid, req.params.id));
  }),
);

app.post('/hooks', runAsync(handleStripeWebhook));
