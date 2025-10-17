import { Types } from 'mongoose';

export interface IFlashcard {
  _id?: Types.ObjectId;
  question: string;
  answer: string;
  subjectId: Types.ObjectId; // REQUERIDO - siempre pertenece a un subject
  deckId?: Types.ObjectId; // OPCIONAL - puede estar en un deck
  userId: Types.ObjectId; // Owner
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  lastReviewed?: Date;
  nextReview?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFlashcardCreateDTO {
  question: string;
  answer: string;
  subjectId: string;
  deckId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface IFlashcardUpdateDTO {
  question?: string;
  answer?: string;
  deckId?: string | null; // null para quitar de deck
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  lastReviewed?: Date;
  nextReview?: Date;
}

export interface IFlashcardResponseDTO {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  deckId?: string;
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lastReviewed?: Date;
  nextReview?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
