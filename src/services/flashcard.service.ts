import { Flashcard } from '../models/Flashcard';
import { Subject } from '../models/Subject';
import { Deck } from '../models/Deck';
import {
  IFlashcard,
  IFlashcardCreateDTO,
  IFlashcardUpdateDTO,
  IFlashcardResponseDTO,
} from '@/interfaces/flashcard.interfaces';
import mongoose from 'mongoose';

export class FlashcardService {
  private toFlashcardResponseDTO(flashcard: IFlashcard): IFlashcardResponseDTO {
    return {
      id: flashcard._id!.toString(),
      question: flashcard.question,
      answer: flashcard.answer,
      subjectId: flashcard.subjectId.toString(),
      deckId: flashcard.deckId?.toString(),
      userId: flashcard.userId.toString(),
      difficulty: flashcard.difficulty || 'medium',
      tags: flashcard.tags || [],
      lastReviewed: flashcard.lastReviewed,
      nextReview: flashcard.nextReview,
      createdAt: flashcard.createdAt,
      updatedAt: flashcard.updatedAt,
    };
  }

  async createFlashcard(
    userId: string,
    flashcardData: IFlashcardCreateDTO
  ): Promise<IFlashcardResponseDTO> {
    // Verificar que el subject existe y pertenece al usuario
    const subject = await Subject.findOne({
      _id: flashcardData.subjectId,
      userId,
    });

    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    // Si se especifica un deck, verificar que existe y pertenece al mismo subject
    if (flashcardData.deckId) {
      const deck = await Deck.findOne({
        _id: flashcardData.deckId,
        userId,
        subjectId: flashcardData.subjectId,
      });

      if (!deck) {
        throw new Error('Deck no encontrado o no pertenece al subject');
      }
    }

    const flashcard = new Flashcard({
      ...flashcardData,
      userId,
    });

    await flashcard.save();
    return this.toFlashcardResponseDTO(flashcard);
  }

  async getFlashcardsBySubject(
    userId: string,
    subjectId: string,
    options: {
      page?: number;
      limit?: number;
      difficulty?: string;
      tags?: string[];
      deckId?: string;
    } = {}
  ): Promise<{
    flashcards: IFlashcardResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, difficulty, tags, deckId } = options;
    const skip = (page - 1) * limit;

    // Verificar que el subject pertenece al usuario
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    // Construir query
    const query: any = { subjectId, userId };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (deckId) {
      query.deckId = deckId;
    } else if (deckId === null) {
      // Para obtener solo flashcards sin deck
      query.deckId = { $exists: false };
    }

    const [flashcards, total] = await Promise.all([
      Flashcard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Flashcard.countDocuments(query),
    ]);

    return {
      flashcards: flashcards.map((flashcard) => this.toFlashcardResponseDTO(flashcard)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFlashcardsByDeck(
    userId: string,
    deckId: string,
    options: {
      page?: number;
      limit?: number;
      difficulty?: string;
      tags?: string[];
    } = {}
  ): Promise<{
    flashcards: IFlashcardResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, difficulty, tags } = options;
    const skip = (page - 1) * limit;

    // Verificar que el deck pertenece al usuario
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      throw new Error('Deck no encontrado');
    }

    // Construir query
    const query: any = { deckId, userId };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const [flashcards, total] = await Promise.all([
      Flashcard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Flashcard.countDocuments(query),
    ]);

    return {
      flashcards: flashcards.map((flashcard) => this.toFlashcardResponseDTO(flashcard)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFlashcardById(userId: string, flashcardId: string): Promise<IFlashcardResponseDTO> {
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!flashcard) {
      throw new Error('Flashcard no encontrada');
    }

    return this.toFlashcardResponseDTO(flashcard);
  }

  async updateFlashcard(
    userId: string,
    flashcardId: string,
    updateData: IFlashcardUpdateDTO
  ): Promise<IFlashcardResponseDTO> {
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!flashcard) {
      throw new Error('Flashcard no encontrada');
    }

    // Si se está cambiando el deck, validar que el nuevo deck pertenece al mismo subject
    if (updateData.deckId !== undefined) {
      if (updateData.deckId === null) {
        // Quitar del deck
        flashcard.deckId = undefined;
      } else {
        // Convertir string a ObjectId
        const deckObjectId = new mongoose.Types.ObjectId(updateData.deckId);
        const deck = await Deck.findOne({
          _id: deckObjectId,
          userId,
          subjectId: flashcard.subjectId,
        });

        if (!deck) {
          throw new Error('Deck no encontrado o no pertenece al mismo subject');
        }
        flashcard.deckId = deckObjectId;
      }
    }

    // Actualizar otros campos
    if (updateData.question !== undefined) flashcard.question = updateData.question;
    if (updateData.answer !== undefined) flashcard.answer = updateData.answer;
    if (updateData.difficulty !== undefined) flashcard.difficulty = updateData.difficulty;
    if (updateData.tags !== undefined) flashcard.tags = updateData.tags;
    if (updateData.lastReviewed !== undefined) flashcard.lastReviewed = updateData.lastReviewed;
    if (updateData.nextReview !== undefined) flashcard.nextReview = updateData.nextReview;

    await flashcard.save();
    return this.toFlashcardResponseDTO(flashcard);
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!flashcard) {
      throw new Error('Flashcard no encontrada');
    }

    await Flashcard.deleteOne({ _id: flashcardId, userId });
  }

  async reviewFlashcard(
    userId: string,
    flashcardId: string,
    performance: 'again' | 'hard' | 'good' | 'easy'
  ): Promise<IFlashcardResponseDTO> {
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!flashcard) {
      throw new Error('Flashcard no encontrada');
    }

    // Lógica simple de spaced repetition
    const now = new Date();
    flashcard.lastReviewed = now;

    // Calcular próximo review basado en performance
    const intervals: Record<string, number> = {
      again: 1, // 1 minuto
      hard: 10, // 10 minutos
      good: 1440, // 1 día
      easy: 4320, // 3 días
    };

    const nextReview = new Date(now.getTime() + intervals[performance] * 60000);
    flashcard.nextReview = nextReview;

    await flashcard.save();
    return this.toFlashcardResponseDTO(flashcard);
  }

  async searchFlashcards(
    userId: string,
    query: string,
    options: {
      page?: number;
      limit?: number;
      subjectId?: string;
      deckId?: string;
    } = {}
  ): Promise<{
    flashcards: IFlashcardResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, subjectId, deckId } = options;
    const skip = (page - 1) * limit;

    // Construir query de búsqueda
    const searchQuery: any = {
      userId,
      $or: [
        { question: { $regex: query, $options: 'i' } },
        { answer: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    if (subjectId) {
      searchQuery.subjectId = subjectId;
    }

    if (deckId) {
      searchQuery.deckId = deckId;
    }

    const [flashcards, total] = await Promise.all([
      Flashcard.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Flashcard.countDocuments(searchQuery),
    ]);

    return {
      flashcards: flashcards.map((flashcard) => this.toFlashcardResponseDTO(flashcard)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDueFlashcards(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      subjectId?: string;
      deckId?: string;
    } = {}
  ): Promise<{
    flashcards: IFlashcardResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, subjectId, deckId } = options;
    const skip = (page - 1) * limit;

    const query: any = {
      userId,
      $or: [{ nextReview: { $lte: new Date() } }, { nextReview: { $exists: false } }],
    };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (deckId) {
      query.deckId = deckId;
    }

    const [flashcards, total] = await Promise.all([
      Flashcard.find(query)
        .sort({ nextReview: 1 }) // Ordenar por las más urgentes primero
        .skip(skip)
        .limit(limit),
      Flashcard.countDocuments(query),
    ]);

    return {
      flashcards: flashcards.map((flashcard) => this.toFlashcardResponseDTO(flashcard)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
