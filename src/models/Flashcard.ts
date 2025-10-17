import { IFlashcard } from '@/interfaces/flashcard.interfaces';
import mongoose, { Schema, Types } from 'mongoose';

export interface IFlashcardDocument extends IFlashcard, Document {
  _id: Types.ObjectId;
  subjectId: Types.ObjectId;
  deckId?: Types.ObjectId;
  userId: Types.ObjectId;
}

const flashcardSchema = new Schema<IFlashcardDocument>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'Deck',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    lastReviewed: {
      type: Date,
    },
    nextReview: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
flashcardSchema.index({ userId: 1, subjectId: 1 });
flashcardSchema.index({ userId: 1, deckId: 1 });
flashcardSchema.index({ userId: 1, nextReview: 1 }); // Para spaced repetition
flashcardSchema.index({ userId: 1, tags: 1 });

// Validación: si tiene deckId, debe pertenecer al mismo subject
flashcardSchema.pre('save', async function (next) {
  if (this.deckId) {
    const Deck = mongoose.model('Deck');
    const deck = await Deck.findById(this.deckId);

    if (deck && deck.subjectId.toString() !== this.subjectId.toString()) {
      return next(new Error('El deck debe pertenecer al mismo subject que la flashcard'));
    }
  }
  next();
});

export const Flashcard = mongoose.model<IFlashcardDocument>('Flashcard', flashcardSchema);
