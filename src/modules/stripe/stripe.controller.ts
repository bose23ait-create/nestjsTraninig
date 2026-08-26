import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  Inject,
  forwardRef,
  Body,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { OrdersService } from '../../services/orders.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      }

      // We must use the raw body for signature verification
      if (!req.rawBody) {
        throw new Error('Raw body is not available');
      }

      event = this.stripeService.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`Payment succeeded for session ${session.id}`);
      await this.ordersService.handlePaymentSuccess('', session.id);
    }

    return { received: true };
  }

  @Post('verify')
  async verifyPayment(@Body('sessionId') sessionId: string) {
    if (!sessionId) throw new BadRequestException('Session ID is required');
    const order = await this.ordersService.verifyPayment(sessionId);
    return { success: true, order };
  }
}
