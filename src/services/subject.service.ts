import { Subject } from '../models/Subject';
import { Deck } from '../models/Deck';
import { Flashcard } from '../models/Flashcard';
import {
  ISubject,
  ISubjectCreateDTO,
  ISubjectResponseDTO,
  ISubjectWithDetailsResponseDTO,
} from '@/interfaces/subject.interfaces';

export class SubjectService {
  private toSubjectResponseDTO(
    subject: ISubject,
    flashcardCount: number = 0,
    deckCount: number = 0
  ): ISubjectResponseDTO {
    return {
      id: subject._id!.toString(),
      name: subject.name,
      description: subject.description,
      userId: subject.userId.toString(),
      flashcardCount,
      deckCount,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  async createSubject(
    userId: string,
    subjectData: ISubjectCreateDTO
  ): Promise<ISubjectResponseDTO> {
    // Verificar si ya existe un subject con el mismo nombre para este usuario
    const existingSubject = await Subject.findOne({
      userId,
      name: subjectData.name,
    });

    if (existingSubject) {
      throw new Error('Ya tienes un subject con este nombre');
    }

    const subject = new Subject({
      ...subjectData,
      userId,
    });

    await subject.save();

    return this.toSubjectResponseDTO(subject);
  }

  async getUserSubjects(userId: string): Promise<ISubjectResponseDTO[]> {
    const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });

    // Obtener conteos para cada subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subject) => {
        const [flashcardCount, deckCount] = await Promise.all([
          Flashcard.countDocuments({ subjectId: subject._id, userId }),
          Deck.countDocuments({ subjectId: subject._id, userId }),
        ]);

        return this.toSubjectResponseDTO(subject, flashcardCount, deckCount);
      })
    );

    return subjectsWithCounts;
  }

  async getSubjectById(userId: string, subjectId: string): Promise<ISubjectWithDetailsResponseDTO> {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    const [flashcards, decks, flashcardCount, deckCount] = await Promise.all([
      // Flashcards sin deck
      Flashcard.find({ subjectId, userId, deckId: { $exists: false } }),
      // Todos los decks del subject
      Deck.find({ subjectId, userId }),
      // Conteo total de flashcards
      Flashcard.countDocuments({ subjectId, userId }),
      // Conteo de decks
      Deck.countDocuments({ subjectId, userId }),
    ]);

    const baseResponse = this.toSubjectResponseDTO(subject, flashcardCount, deckCount);

    return {
      ...baseResponse,
      flashcards: flashcards.map((flashcard) => ({
        id: flashcard._id.toString(),
        question: flashcard.question,
        answer: flashcard.answer,
        subjectId: flashcard.subjectId.toString(),
        deckId: flashcard.deckId?.toString(),
        userId: flashcard.userId.toString(),
        difficulty: flashcard.difficulty || 'easy', // Provide a default value
        tags: flashcard.tags || [],
        lastReviewed: flashcard.lastReviewed,
        nextReview: flashcard.nextReview,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt,
      })),
      decks: decks.map((deck) => ({
        id: deck._id.toString(),
        name: deck.name,
        description: deck.description,
        subjectId: deck.subjectId.toString(),
        userId: deck.userId.toString(),
        flashcardCount: 0, // Se puede calcular si es necesario
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
      })),
    };
  }

  async updateSubject(
    userId: string,
    subjectId: string,
    updateData: Partial<ISubjectCreateDTO>
  ): Promise<ISubjectResponseDTO> {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateData.name && updateData.name !== subject.name) {
      const existingSubject = await Subject.findOne({
        userId,
        name: updateData.name,
        _id: { $ne: subjectId },
      });

      if (existingSubject) {
        throw new Error('Ya tienes un subject con este nombre');
      }
    }

    Object.assign(subject, updateData);
    await subject.save();

    // Obtener conteos actualizados
    const [flashcardCount, deckCount] = await Promise.all([
      Flashcard.countDocuments({ subjectId, userId }),
      Deck.countDocuments({ subjectId, userId }),
    ]);

    return this.toSubjectResponseDTO(subject, flashcardCount, deckCount);
  }

  async deleteSubject(userId: string, subjectId: string): Promise<void> {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    // Usar transacción para eliminar todo relacionado
    const session = await Subject.startSession();
    session.startTransaction();

    try {
      // Eliminar subject, decks y flashcards relacionados
      await Promise.all([
        Subject.deleteOne({ _id: subjectId }, { session }),
        Deck.deleteMany({ subjectId, userId }, { session }),
        Flashcard.deleteMany({ subjectId, userId }, { session }),
      ]);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getSubjectStats(userId: string, subjectId: string): Promise<any> {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      throw new Error('Subject no encontrado');
    }

    const stats = await Flashcard.aggregate([
      { $match: { subjectId: subject._id, userId } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalFlashcards = await Flashcard.countDocuments({ subjectId, userId });
    const totalDecks = await Deck.countDocuments({ subjectId, userId });
    const dueForReview = await Flashcard.countDocuments({
      subjectId,
      userId,
      nextReview: { $lte: new Date() },
    });

    return {
      totalFlashcards,
      totalDecks,
      dueForReview,
      difficultyBreakdown: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
