import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name!: string;

  @Prop()
  email!: string;

  @Prop({ select: false })
  password!: string;

  @Prop()
  age!: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Role',
  })
  role!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
