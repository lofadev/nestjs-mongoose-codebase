import { ClientSession, Model, PipelineStage, QueryFilter, Types, UpdateQuery } from 'mongoose';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
  select?: string;
}

export interface PaginateResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  // ── Create ──────────────────────────────────────────────

  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    const doc = new this.model(data);
    return doc.save({ session }) as unknown as Promise<T>;
  }

  async createMany(data: Partial<T>[], session?: ClientSession): Promise<T[]> {
    return this.model.insertMany(data, {
      ordered: true,
      session,
    }) as unknown as Promise<T[]>;
  }

  // ── Read ────────────────────────────────────────────────

  async findById(id: string | Types.ObjectId, session?: ClientSession): Promise<T | null> {
    const query = this.model.findById(id);
    if (session) query.session(session);
    return query.exec();
  }

  async findOne(filter: QueryFilter<T>, session?: ClientSession): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (session) query.session(session);
    return query.exec();
  }

  async find(filter: QueryFilter<T> = {} as QueryFilter<T>, session?: ClientSession): Promise<T[]> {
    const query = this.model.find(filter);
    if (session) query.session(session);
    return query.lean().exec();
  }

  async paginate(
    filter: QueryFilter<T> = {} as QueryFilter<T>,
    options: PaginateOptions = {},
  ): Promise<PaginateResult<T>> {
    const { page = 1, limit = 10, sort, populate, select } = options;
    const skip = (page - 1) * limit;

    const query = this.model.find(filter).skip(skip).limit(limit);

    if (sort) query.sort(sort);
    if (select) query.select(select);
    if (populate) {
      const fields = Array.isArray(populate) ? populate : [populate];
      for (const field of fields) {
        query.populate(field);
      }
    }

    const [data, total] = await Promise.all([query.lean().exec(), this.model.countDocuments(filter).lean().exec()]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // ── Update ──────────────────────────────────────────────

  async update(id: string | Types.ObjectId, data: UpdateQuery<T>, session?: ClientSession): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true, session }).exec();
  }

  async updateOne(filter: QueryFilter<T>, data: UpdateQuery<T>, session?: ClientSession): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, data, {
        new: true,
        runValidators: true,
        session,
      })
      .exec();
  }

  async updateMany(filter: QueryFilter<T>, data: UpdateQuery<T>, session?: ClientSession): Promise<number> {
    const result = await this.model.updateMany(filter, data, { runValidators: true, session }).exec();
    return result.modifiedCount;
  }

  // ── Delete ──────────────────────────────────────────────

  async softDelete(id: string | Types.ObjectId, session?: ClientSession): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { deletedAt: new Date() } as UpdateQuery<T>, {
        new: true,
        session,
      })
      .exec();
  }

  async restore(id: string | Types.ObjectId, session?: ClientSession): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { deletedAt: null } as UpdateQuery<T>, {
        new: true,
        session,
      })
      .exec();
  }

  async hardDelete(id: string | Types.ObjectId, session?: ClientSession): Promise<T | null> {
    return this.model.findByIdAndDelete(id, { session }).exec();
  }

  async deleteMany(filter: QueryFilter<T>, session?: ClientSession): Promise<number> {
    const query = this.model.deleteMany(filter);
    if (session) query.session(session);
    const result = await query.exec();
    return result.deletedCount;
  }

  // ── Utility ─────────────────────────────────────────────

  async count(filter: QueryFilter<T> = {} as QueryFilter<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return result !== null;
  }

  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.model.aggregate<R>(pipeline).exec();
  }
}
