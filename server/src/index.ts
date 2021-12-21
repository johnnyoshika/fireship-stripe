import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') config();

console.log(process.env.STRIPE_SECRET);
