import { IDeck } from '@/interfaces/deck.interface';
import mongoose, { Schema, Types } from 'mongoose';

export interface IDeckDocument extends IDeck, Document {
  _id: Types.ObjectId;
  subjectId: Types.ObjectId;
  userId: Types.ObjectId;
}

const deckSchema = new Schema<IDeckDocument>(
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
    subjectId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Subject',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto - un usuario no puede tener decks con mismo nombre en mismo subject
deckSchema.index({ subjectId: 1, name: 1, userId: 1 }, { unique: true });

export const Deck = mongoose.model<IDeckDocument>('Deck', deckSchema);
