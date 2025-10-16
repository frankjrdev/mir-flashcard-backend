import { Request, Response, NextFunction } from 'express';
import {
  getFlashcards,
  getFlashcard,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from '../controllers/flashcardController';
import Flashcard from '../models/Flashcard';
import Subject from '../models/Subject';
import sendResponse from '../utils/responseHandler';
import { AuthenticatedRequest } from './types';

// Mock de las dependencias
jest.mock('../models/Flashcard');
jest.mock('../models/Subject');
jest.mock('../utils/responseHandler');

const mockFlashcard = Flashcard as jest.Mocked<typeof Flashcard>;
const mockSubject = Subject as jest.Mocked<typeof Subject>;
const mockSendResponse = sendResponse as jest.MockedFunction<typeof sendResponse>;

describe('FlashcardController', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: { id: 'user123', role: 'user' },
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getFlashcards', () => {
    describe('GIVEN a user requests flashcards for a specific subject', () => {
      describe('WHEN the subject exists and user has access', () => {
        test('THEN should return flashcards successfully', async () => {
          // GIVEN: Mock data setup
          const mockSubjectData = {
            _id: 'subject123',
            name: 'Math',
            createdBy: 'user123',
          };
          const mockFlashcardsData = [
            { _id: 'card1', question: 'What is 2+2?', answer: '4', subject: 'subject123' },
            { _id: 'card2', question: 'What is 3+3?', answer: '6', subject: 'subject123' },
          ];

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockFlashcard.find.mockResolvedValue(mockFlashcardsData);

          mockReq.params = { subjectId: 'subject123' };

          // WHEN: Function is called
          await getFlashcards(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call database methods and send response
          expect(mockSubject.findById).toHaveBeenCalledWith('subject123');
          expect(mockFlashcard.find).toHaveBeenCalledWith({ subject: 'subject123' });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcards retrieved successfully',
            { flashcards: mockFlashcardsData }
          );
        });
      });

      describe('WHEN the subject does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Subject not found
          mockSubject.findById.mockResolvedValue(null);
          mockReq.params = { subjectId: 'nonexistent' };

          // WHEN: Function is called
          await getFlashcards(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Subject not found with id of nonexistent',
            })
          );
        });
      });

      describe('WHEN user does not have access to subject', () => {
        test('THEN should call next with authorization error', async () => {
          // GIVEN: Subject exists but user doesn't own it
          const mockSubjectData = {
            _id: 'subject123',
            name: 'Math',
            createdBy: 'otheruser123',
          };
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { subjectId: 'subject123' };
          mockReq.user = { id: 'user123', role: 'user' };

          // WHEN: Function is called
          await getFlashcards(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this subject',
            })
          );
        });
      });

      describe('WHEN admin user accesses any subject', () => {
        test('THEN should return flashcards successfully', async () => {
          // GIVEN: Admin user accessing any subject
          const mockSubjectData = {
            _id: 'subject123',
            name: 'Math',
            createdBy: 'otheruser123',
          };
          const mockFlashcardsData = [{ _id: 'card1', question: 'What is 2+2?', answer: '4' }];

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockFlashcard.find.mockResolvedValue(mockFlashcardsData);
          mockReq.params = { subjectId: 'subject123' };
          mockReq.user = { id: 'admin123', role: 'admin' };

          // WHEN: Function is called
          await getFlashcards(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return flashcards (admin can access any subject)
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcards retrieved successfully',
            { flashcards: mockFlashcardsData }
          );
        });
      });
    });

    describe('GIVEN a user requests all flashcards without subject filter', () => {
      describe('WHEN user has subjects', () => {
        test('THEN should return all flashcards from user subjects', async () => {
          // GIVEN: No subjectId in params, user has subjects
          const mockSubjects = [
            { _id: 'subject1', name: 'Math' },
            { _id: 'subject2', name: 'Science' },
          ];
          const mockFlashcardsData = [
            { _id: 'card1', question: 'Math question', answer: 'Math answer' },
            { _id: 'card2', question: 'Science question', answer: 'Science answer' },
          ];

          mockSubject.find.mockResolvedValue(mockSubjects);
          mockFlashcard.find.mockResolvedValue(mockFlashcardsData);

          // WHEN: Function is called without subjectId
          await getFlashcards(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return all user's flashcards
          expect(mockSubject.find).toHaveBeenCalledWith({ createdBy: 'user123' });
          expect(mockFlashcard.find).toHaveBeenCalledWith({
            subject: { $in: ['subject1', 'subject2'] },
          });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcards retrieved successfully',
            { flashcards: mockFlashcardsData }
          );
        });
      });
    });
  });

  describe('getFlashcard', () => {
    describe('GIVEN a user requests a specific flashcard', () => {
      describe('WHEN flashcard exists and user has access', () => {
        test('THEN should return the flashcard', async () => {
          // GIVEN: Valid flashcard and subject
          const mockFlashcardData = {
            _id: 'card123',
            question: 'What is 2+2?',
            answer: '4',
            subject: 'subject123',
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { id: 'card123' };

          // WHEN: Function is called
          await getFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return the flashcard
          expect(mockFlashcard.findById).toHaveBeenCalledWith('card123');
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcard retrieved successfully',
            { flashcard: mockFlashcardData }
          );
        });
      });

      describe('WHEN flashcard does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Flashcard not found
          mockFlashcard.findById.mockResolvedValue(null);
          mockReq.params = { id: 'nonexistent' };

          // WHEN: Function is called
          await getFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Flashcard not found with id of nonexistent',
            })
          );
        });
      });

      describe('WHEN user does not have access to flashcard', () => {
        test('THEN should call next with authorization error', async () => {
          // GIVEN: Flashcard exists but user doesn't own the subject
          const mockFlashcardData = {
            _id: 'card123',
            subject: 'subject123',
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'otheruser123',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { id: 'card123' };

          // WHEN: Function is called
          await getFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this flashcard',
            })
          );
        });
      });
    });
  });

  describe('createFlashcard', () => {
    describe('GIVEN a user wants to create a flashcard', () => {
      describe('WHEN all data is valid and user has access', () => {
        test('THEN should create flashcard successfully', async () => {
          // GIVEN: Valid data and authorized user
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const mockFlashcardData = {
            _id: 'card123',
            question: 'What is 2+2?',
            answer: '4',
            subject: 'subject123',
            createdBy: 'user123',
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockFlashcard.create.mockResolvedValue(mockFlashcardData as any);
          mockReq.params = { subjectId: 'subject123' };
          mockReq.body = {
            question: 'What is 2+2?',
            answer: '4',
            difficulty: 'easy',
          };

          // WHEN: Function is called
          await createFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should create flashcard
          expect(mockSubject.findById).toHaveBeenCalledWith('subject123');
          expect(mockFlashcard.create).toHaveBeenCalledWith({
            question: 'What is 2+2?',
            answer: '4',
            difficulty: 'easy',
            subject: 'subject123',
            createdBy: 'user123',
          });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            201,
            true,
            'Flashcard created successfully',
            { flashcard: mockFlashcardData }
          );
        });
      });

      describe('WHEN subject does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Subject not found
          mockSubject.findById.mockResolvedValue(null);
          mockReq.params = { subjectId: 'nonexistent' };

          // WHEN: Function is called
          await createFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Subject not found with id of nonexistent',
            })
          );
        });
      });

      describe('WHEN user does not have access to subject', () => {
        test('THEN should call next with authorization error', async () => {
          // GIVEN: Subject exists but user doesn't own it
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'otheruser123',
          };
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { subjectId: 'subject123' };

          // WHEN: Function is called
          await createFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to add flashcards to this subject',
            })
          );
        });
      });

      describe('WHEN required fields are missing', () => {
        test('THEN should handle validation error', async () => {
          // GIVEN: Missing required fields
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const validationError = new Error('Validation failed');
          (validationError as any).name = 'ValidationError';

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockFlashcard.create.mockRejectedValue(validationError);
          mockReq.params = { subjectId: 'subject123' };
          mockReq.body = { question: 'What is 2+2?' }; // Missing answer

          // WHEN: Function is called
          await createFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with validation error
          expect(mockNext).toHaveBeenCalledWith(validationError);
        });
      });
    });
  });

  describe('updateFlashcard', () => {
    describe('GIVEN a user wants to update a flashcard', () => {
      describe('WHEN flashcard exists and user has access', () => {
        test('THEN should update flashcard successfully', async () => {
          // GIVEN: Valid flashcard and authorized user
          const mockFlashcardData = {
            _id: 'card123',
            subject: 'subject123',
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const updatedFlashcardData = {
            _id: 'card123',
            question: 'Updated question',
            answer: 'Updated answer',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockFlashcard.findByIdAndUpdate.mockResolvedValue(updatedFlashcardData);
          mockReq.params = { id: 'card123' };
          mockReq.body = {
            question: 'Updated question',
            answer: 'Updated answer',
          };

          // WHEN: Function is called
          await updateFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should update flashcard
          expect(mockFlashcard.findById).toHaveBeenCalledWith('card123');
          expect(mockFlashcard.findByIdAndUpdate).toHaveBeenCalledWith('card123', mockReq.body, {
            new: true,
            runValidators: true,
          });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcard updated successfully',
            { flashcard: updatedFlashcardData }
          );
        });
      });

      describe('WHEN flashcard does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Flashcard not found
          mockFlashcard.findById.mockResolvedValue(null);
          mockReq.params = { id: 'nonexistent' };

          // WHEN: Function is called
          await updateFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Flashcard not found with id of nonexistent',
            })
          );
        });
      });

      describe('WHEN user does not have access to flashcard', () => {
        test('THEN should call next with authorization error', async () => {
          // GIVEN: Flashcard exists but user doesn't own the subject
          const mockFlashcardData = {
            _id: 'card123',
            subject: 'subject123',
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'otheruser123',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { id: 'card123' };

          // WHEN: Function is called
          await updateFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to update this flashcard',
            })
          );
        });
      });
    });
  });

  describe('deleteFlashcard', () => {
    describe('GIVEN a user wants to delete a flashcard', () => {
      describe('WHEN flashcard exists and user has access', () => {
        test('THEN should delete flashcard successfully', async () => {
          // GIVEN: Valid flashcard and authorized user
          const mockFlashcardData = {
            _id: 'card123',
            subject: 'subject123',
            deleteOne: jest.fn().mockResolvedValue({}),
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { id: 'card123' };

          // WHEN: Function is called
          await deleteFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should delete flashcard
          expect(mockFlashcard.findById).toHaveBeenCalledWith('card123');
          expect(mockFlashcardData.deleteOne).toHaveBeenCalled();
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Flashcard deleted successfully',
            {}
          );
        });
      });

      describe('WHEN flashcard does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Flashcard not found
          mockFlashcard.findById.mockResolvedValue(null);
          mockReq.params = { id: 'nonexistent' };

          // WHEN: Function is called
          await deleteFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Flashcard not found with id of nonexistent',
            })
          );
        });
      });

      describe('WHEN user does not have access to flashcard', () => {
        test('THEN should call next with authorization error', async () => {
          // GIVEN: Flashcard exists but user doesn't own the subject
          const mockFlashcardData = {
            _id: 'card123',
            subject: 'subject123',
          };
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'otheruser123',
          };

          mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockReq.params = { id: 'card123' };

          // WHEN: Function is called
          await deleteFlashcard(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to delete this flashcard',
            })
          );
        });
      });
    });
  });

  // CASOS BORDE ADICIONALES
  describe('Edge Cases', () => {
    describe('GIVEN invalid ObjectId format', () => {
      test('THEN should handle CastError gracefully', async () => {
        // GIVEN: Invalid ObjectId format
        const castError = new Error('Cast to ObjectId failed');
        (castError as any).name = 'CastError';
        mockFlashcard.findById.mockRejectedValue(castError);
        mockReq.params = { id: 'invalid-id' };

        // WHEN: Function is called
        await getFlashcard(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(castError);
      });
    });

    describe('GIVEN database connection error', () => {
      test('THEN should handle database error gracefully', async () => {
        // GIVEN: Database connection error
        const dbError = new Error('Database connection failed');
        mockFlashcard.find.mockRejectedValue(dbError);
        mockReq.params = { subjectId: 'subject123' };

        // WHEN: Function is called
        await getFlashcards(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(dbError);
      });
    });

    describe('GIVEN empty flashcard list', () => {
      test('THEN should return empty array successfully', async () => {
        // GIVEN: No flashcards found
        const mockSubjectData = {
          _id: 'subject123',
          createdBy: 'user123',
        };

        mockSubject.findById.mockResolvedValue(mockSubjectData);
        mockFlashcard.find.mockResolvedValue([]);
        mockReq.params = { subjectId: 'subject123' };

        // WHEN: Function is called
        await getFlashcards(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should return empty array
        expect(mockSendResponse).toHaveBeenCalledWith(
          mockRes,
          200,
          true,
          'Flashcards retrieved successfully',
          { flashcards: [] }
        );
      });
    });

    describe('GIVEN very long flashcard content', () => {
      test('THEN should handle large content successfully', async () => {
        // GIVEN: Very long question and answer
        const longQuestion = 'A'.repeat(10000);
        const longAnswer = 'B'.repeat(10000);
        const mockFlashcardData = {
          _id: 'card123',
          question: longQuestion,
          answer: longAnswer,
          subject: 'subject123',
        };
        const mockSubjectData = {
          _id: 'subject123',
          createdBy: 'user123',
        };

        mockFlashcard.findById.mockResolvedValue(mockFlashcardData);
        mockSubject.findById.mockResolvedValue(mockSubjectData);
        mockReq.params = { id: 'card123' };

        // WHEN: Function is called
        await getFlashcard(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should handle large content
        expect(mockSendResponse).toHaveBeenCalledWith(
          mockRes,
          200,
          true,
          'Flashcard retrieved successfully',
          { flashcard: mockFlashcardData }
        );
      });
    });
  });
});
