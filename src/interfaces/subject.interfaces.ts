import { IDeckResponseDTO } from './deck.interface';
import { IFlashcardResponseDTO } from './flashcard.interfaces';

export interface ISubject {
  _id?: string;
  name: string;
  description?: string;
  decks: string[]; // Array de Deck IDs
  flashcards: string[]; // Array de Flashcard IDs sueltas (sin deck)
  createdBy: string; // User ID
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubjectCreateDTO {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface ISubjectResponseDTO {
  id: string;
  name: string;
  description?: string;
  deckCount: number;
  totalFlashcards: number;
  looseFlashcardsCount: number; // Flashcards sin deck
  isPublic: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubjectWithDetailsResponseDTO extends ISubjectResponseDTO {
  decks: IDeckResponseDTO[];
  looseFlashcards: IFlashcardResponseDTO[];
}
