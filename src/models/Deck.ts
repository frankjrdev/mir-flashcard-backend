import { IDeck } from '@/interfaces/deck.interface';
import mongoose, { Document, Schema } from 'mongoose';

const deckSchema = new Schema<IDeck>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    flashcards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Flashcard',
      },
    ],
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

// Middleware to clean up references when a deck is deleted
deckSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Remove references in Subject
    const Subject = mongoose.model('Subject');
    await Subject.updateMany({ decks: doc._id }, { $pull: { decks: doc._id } });
  }
});

export const Deck = mongoose.model<IDeck>('Deck', deckSchema);
