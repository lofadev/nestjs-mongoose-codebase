import { Prop, Schema, SchemaOptions } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export const BASE_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};

@Schema()
export class BaseSchema {
  _id: Types.ObjectId;

  @Prop({ default: null, type: Date })
  deletedAt: Date | null;
}
