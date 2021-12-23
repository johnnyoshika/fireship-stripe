import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
export const app = express();

// modify express.json middle to add rawBody buffer to the request
// so that rawBody can be used to verify Stripe's webhook signed request
app.use(
  express.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer),
  }),
);

app.use(cors({ origin: true }));

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

app.post('/hooks', runAsync(handleStripeWebhook));
