export interface IFlashcard {
  _id?: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctAnswers: number;
  createdBy: string; // User ID
  createdAt?: Date;
  updatedAt?: Date;
}

// DTOs para creación y respuesta
export interface IFlashcardCreateDTO {
  question: string;
  answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface IFlashcardResponseDTO {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctAnswers: number;
  deckId?: string; // ID del deck si pertenece a uno
  subjectId: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
