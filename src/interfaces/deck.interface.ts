import { Types } from 'mongoose';
import { IFlashcardResponseDTO } from './flashcard.interfaces';

export interface IDeck {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  subjectId: Types.ObjectId; // Pertenece a un subject
  userId: Types.ObjectId; // Pertenece a un subject // Owner for authorization
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDeckCreateDTO {
  name: string;
  description?: string;
  subjectId: string;
}

export interface IDeckResponseDTO {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  userId: string;
  flashcardCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDeckWithFlashcardsResponseDTO extends IDeckResponseDTO {
  flashcards: IFlashcardResponseDTO[];
}
