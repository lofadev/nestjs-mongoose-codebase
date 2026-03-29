import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class BaseSchema {
  @Prop({ default: null, type: Date })
  deletedAt: Date | null;
}
