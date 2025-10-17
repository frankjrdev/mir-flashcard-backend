import { ISubject } from '@/interfaces/subject.interfaces';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubjectDocument extends ISubject, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
}

const subjectSchema = new Schema<ISubjectDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model<ISubjectDocument>('Subject', subjectSchema);
