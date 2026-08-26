import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('STRIPE_SECRET_KEY') ||
      'sk_test_placeholder';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2026-07-29.dahlia',
    });
  }

  async createCheckoutSession(
    userId: string,
    items: Array<{
      productId: string | { toString(): string };
      quantity: number;
      price: number;
      name: string;
      images: string[];
    }>,
    customerDetails: { email: string; name: string },
    total: number,
  ) {
    const orderDataStr = JSON.stringify({
      userId,
      items: items.map((i) => ({
        productId: i.productId.toString(),
        quantity: i.quantity,
        price: i.price,
        name: i.name,
        images: i.images,
      })),
      customerDetails,
      total,
    });

    const metadata: Record<string, string> = {};
    for (let i = 0; i < orderDataStr.length; i += 500) {
      metadata[`chunk_${Math.floor(i / 500)}`] = orderDataStr.substring(
        i,
        i + 500,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents/paise
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${this.configService.get<string>('FRONTEND_URL')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/checkout/cancel`,
      customer_email: customerDetails.email,
      metadata,
    });

    return session;
  }

  async refundPayment(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.payment_intent) {
      throw new Error('No payment intent found for this session.');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: session.payment_intent as string,
    });

    return refund;
  }
}
