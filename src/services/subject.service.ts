import {
  ISubjectCreateDTO,
  ISubjectResponseDTO,
  ISubjectWithDetailsResponseDTO,
} from '@/interfaces/subject.interfaces';
import { Subject } from '@/models/Subject';

export class SubjectService {
  // ===== SUBJECT METHODS =====
  async createSubject(
    subjectData: ISubjectCreateDTO,
    userId: string
  ): Promise<ISubjectResponseDTO> {
    const subject = new Subject({
      ...subjectData,
      createdBy: userId,
    });

    await subject.save();
    return this.toSubjectResponseDTO(subject);
  }

  async getSubjectsByUser(userId: string): Promise<ISubjectResponseDTO[]> {
    const subjects = await Subject.find({ createdBy: userId }).sort({ createdAt: -1 });

    return Promise.all(subjects.map((subject) => this.toSubjectResponseDTO(subject)));
  }

  async getSubjectById(subjectId: string, userId: string): Promise<ISubjectWithDetailsResponseDTO> {
    const subject = await Subject.findOne({
      _id: subjectId,
      createdBy: userId,
    })
      .populate('decks')
      .populate('flashcards');

    if (!subject) {
      throw new Error('Asignatura no encontrada');
    }

    return this.toSubjectWithDetailsResponseDTO(subject);
  }

  async updateSubject(
    subjectId: string,
    updateData: Partial<ISubjectCreateDTO>,
    userId: string
  ): Promise<ISubjectResponseDTO> {
    const subject = await Subject.findOneAndUpdate(
      { _id: subjectId, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!subject) {
      throw new Error('Asignatura no encontrada');
    }

    return this.toSubjectResponseDTO(subject);
  }

  async deleteSubject(subjectId: string, userId: string): Promise<void> {
    const result = await Subject.findOneAndDelete({
      _id: subjectId,
      createdBy: userId,
    });

    if (!result) {
      throw new Error('Asignatura no encontrada');
    }
  }

  private async toSubjectResponseDTO(subject: ISubject): ISubjectResponseDTO {
    return {
      id: subject._id!,
      name: subject.name,
      description: subject.description,
      deckCount: subject.decks.length,
      totalFlashcards: await this.calculateTotalFlashcards(subject),
      looseFlashcards: subject.flashcards.length,
      isPublic: subject.isPublic,
      createdBy: subject.createdBy.toString(),
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  private async calculateTotalFlashcards(subject: ISubject): Promise<number> {
    const deckFlashcardsCount = await Deck.aggregate([
      { $match: { _id: { $in: subject.decks } } },
      { $project: { count: { $size: '$flashcards' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    const totalFromDecks = deckFlashcardsCount[0]?.total || 0;
    return totalFromDecks + subject.flashcards.length;
  }
}
