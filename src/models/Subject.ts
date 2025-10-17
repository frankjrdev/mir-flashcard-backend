import { ISubject } from '@/interfaces/subject.interfaces';
import mongoose, { Schema } from 'mongoose';

const subjectSchema = new Schema<ISubject>(
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
    decks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Deck',
      },
    ],
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
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para limpiar referencias cuando se elimina una asignatura
subjectSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Deck = mongoose.model('Deck');
    const Flashcard = mongoose.model('Flashcard');

    // Eliminar todos los decks de la asignatura
    await Deck.deleteMany({ _id: { $in: doc.decks } });

    // Eliminar todas las flashcards sueltas de la asignatura
    await Flashcard.deleteMany({ _id: { $in: doc.flashcards } });
  }
});

// Índices para búsquedas eficientes
subjectSchema.index({ createdBy: 1, createdAt: -1 });
subjectSchema.index({ isPublic: 1 });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
