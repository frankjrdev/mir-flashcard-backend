import { IFlashcard } from '@/interfaces/flashcard.interfaces';
import mongoose, { Document, Schema } from 'mongoose';

const flashcardSchema = new Schema<IFlashcard>(
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
    explanation: {
      type: String,
      trim: true,
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
    reviewCount: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
flashcardSchema.index({ createdBy: 1, createdAt: -1 });
flashcardSchema.index({ tags: 1 });
flashcardSchema.index({ difficulty: 1 });

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);
