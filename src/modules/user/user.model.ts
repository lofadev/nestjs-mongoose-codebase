import { BASE_SCHEMA_OPTIONS, BaseSchema } from '@/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Schema(BASE_SCHEMA_OPTIONS)
export class User extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
