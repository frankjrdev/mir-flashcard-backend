import { Types } from 'mongoose';
import { IDeckResponseDTO } from './deck.interface';
import { IFlashcardResponseDTO } from './flashcard.interfaces';

export interface ISubject {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  userId: Types.ObjectId; // Owner for authorization
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubjectCreateDTO {
  name: string;
  description?: string;
}

export interface ISubjectResponseDTO {
  id: string;
  name: string;
  description?: string;
  userId: string;
  flashcardCount: number;
  deckCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubjectWithDetailsResponseDTO extends ISubjectResponseDTO {
  decks: IDeckResponseDTO[];
  flashcards: IFlashcardResponseDTO[]; // Flashcards sin deck
}
