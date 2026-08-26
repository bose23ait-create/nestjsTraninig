import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ type: [String], default: [] })
  images!: string[];
}

@Schema({ _id: false })
export class CustomerDetails {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: true })
  postalCode!: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ type: CustomerDetails, required: true })
  customerDetails!: CustomerDetails;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({
    enum: ['pending', 'processing', 'shipped', 'completed', 'cancellation_requested', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancellation_requested' | 'cancelled';

  @Prop({
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  })
  paymentStatus!: 'pending' | 'paid' | 'failed' | 'refunded';

  @Prop({ type: String })
  stripeSessionId?: string;

  @Prop({ type: String })
  cancellationReason?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
