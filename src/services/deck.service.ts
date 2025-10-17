import { Deck } from '../models/Deck';
import { Flashcard } from '../models/Flashcard';
import { Subject } from '../models/Subject';
import {
  IDeck,
  IDeckCreateDTO,
  IDeckResponseDTO,
  IDeckWithFlashcardsResponseDTO,
} from '@/interfaces/deck.interface';

export class DeckService {
  private toDeckResponseDTO(deck: IDeck, flashcardCount: number = 0): IDeckResponseDTO {
    return {
      id: deck._id!.toString(),
      name: deck.name,
      description: deck.description,
      subjectId: deck.subjectId.toString(),
      userId: deck.userId.toString(),
      flashcardCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async createDeck(userId: string, deckData: IDeckCreateDTO): Promise<IDeckResponseDTO> {
    // Verificar que el subject existe y pertenece al usuario
    const subject = await Subject.findOne({
      _id: deckData.subjectId,
      userId,
    });

    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    // Verificar que no existe un deck con el mismo nombre en este subject
    const existingDeck = await Deck.findOne({
      subjectId: deckData.subjectId,
      userId,
      name: deckData.name,
    });

    if (existingDeck) {
      throw new Error('Ya tienes un deck con este nombre en este subject');
    }

    const deck = new Deck({
      ...deckData,
      userId,
    });

    await deck.save();

    return this.toDeckResponseDTO(deck);
  }

  async getDecksBySubject(userId: string, subjectId: string): Promise<IDeckResponseDTO[]> {
    // Verificar que el subject pertenece al usuario
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    const decks = await Deck.find({ subjectId, userId }).sort({ createdAt: -1 });

    // Obtener conteo de flashcards para cada deck
    const decksWithCounts = await Promise.all(
      decks.map(async (deck) => {
        const flashcardCount = await Flashcard.countDocuments({
          deckId: deck._id,
          userId,
        });

        return this.toDeckResponseDTO(deck, flashcardCount);
      })
    );

    return decksWithCounts;
  }

  async getDeckWithFlashcards(
    userId: string,
    deckId: string
  ): Promise<IDeckWithFlashcardsResponseDTO> {
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      throw new Error('Deck no encontrado');
    }

    const flashcards = await Flashcard.find({ deckId, userId }).sort({ createdAt: -1 });
    const flashcardCount = await Flashcard.countDocuments({ deckId, userId });

    const baseResponse = this.toDeckResponseDTO(deck, flashcardCount);

    return {
      ...baseResponse,
      flashcards: flashcards.map((flashcard) => ({
        id: flashcard._id.toString(),
        question: flashcard.question,
        answer: flashcard.answer,
        subjectId: flashcard.subjectId.toString(),
        deckId: flashcard.deckId?.toString(),
        userId: flashcard.userId.toString(),
        difficulty: flashcard.difficulty || 'easy',
        tags: flashcard.tags || [],
        lastReviewed: flashcard.lastReviewed,
        nextReview: flashcard.nextReview,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt,
      })),
    };
  }

  async updateDeck(
    userId: string,
    deckId: string,
    updateData: Partial<IDeckCreateDTO>
  ): Promise<IDeckResponseDTO> {
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      throw new Error('Deck no encontrado');
    }

    // Si se está actualizando el nombre, verificar que no exista conflicto
    if (updateData.name && updateData.name !== deck.name) {
      const existingDeck = await Deck.findOne({
        subjectId: deck.subjectId,
        userId,
        name: updateData.name,
        _id: { $ne: deckId },
      });

      if (existingDeck) {
        throw new Error('Ya tienes un deck con este nombre en este subject');
      }
    }

    Object.assign(deck, updateData);
    await deck.save();

    const flashcardCount = await Flashcard.countDocuments({ deckId, userId });
    return this.toDeckResponseDTO(deck, flashcardCount);
  }

  async deleteDeck(userId: string, deckId: string): Promise<void> {
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      throw new Error('Deck no encontrado');
    }

    const session = await Deck.startSession();
    session.startTransaction();

    try {
      // Eliminar deck y quitar deckId de las flashcards (no eliminarlas)
      await Promise.all([
        Deck.deleteOne({ _id: deckId }, { session }),
        Flashcard.updateMany({ deckId, userId }, { $unset: { deckId: '' } }, { session }),
      ]);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async moveFlashcardsToDeck(
    userId: string,
    deckId: string,
    flashcardIds: string[]
  ): Promise<void> {
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      throw new Error('Deck no encontrado');
    }

    // Verificar que todas las flashcards existen y pertenecen al usuario
    const flashcards = await Flashcard.find({
      _id: { $in: flashcardIds },
      userId,
    });

    if (flashcards.length !== flashcardIds.length) {
      throw new Error('Algunas flashcards no fueron encontradas');
    }

    // Verificar que todas las flashcards pertenecen al mismo subject que el deck
    const invalidFlashcards = flashcards.filter(
      (flashcard) => flashcard.subjectId.toString() !== deck.subjectId.toString()
    );

    if (invalidFlashcards.length > 0) {
      throw new Error('Algunas flashcards no pertenecen al mismo subject que el deck');
    }

    // Mover flashcards al deck
    await Flashcard.updateMany({ _id: { $in: flashcardIds }, userId }, { deckId });
  }
}
