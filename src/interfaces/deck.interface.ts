export interface IDeckCreateDTO {
  name: string;
  description?: string;
}

export interface IDeck {
  _id?: string;
  name: string;
  description?: string;
  flashcards: string[]; // Array de Flashcard IDs
  createdBy: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDeckResponseDTO {
  id: string;
  name: string;
  description?: string;
  flashcardCount: number;
  subjectId: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
