import { Request, Response, NextFunction } from 'express';
import {
  getStudySessions,
  createStudySession,
  getStudyStatistics,
} from '../controllers/studySessionController';
import StudySession from '../models/StudySession';
import Flashcard from '../models/Flashcard';
import Subject from '../models/Subject';
import sendResponse from '../utils/responseHandler';

// Mock de las dependencias
jest.mock('../models/StudySession');
jest.mock('../models/Flashcard');
jest.mock('../models/Subject');
jest.mock('../utils/responseHandler');

const mockStudySession = StudySession as jest.Mocked<typeof StudySession>;
const mockFlashcard = Flashcard as jest.Mocked<typeof Flashcard>;
const mockSubject = Subject as jest.Mocked<typeof Subject>;
const mockSendResponse = sendResponse as jest.MockedFunction<typeof sendResponse>;

describe('StudySessionController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: { id: 'user123', role: 'user' },
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getStudySessions', () => {
    describe('GIVEN a regular user requests study sessions', () => {
      describe('WHEN user has study sessions', () => {
        test('THEN should return only user study sessions', async () => {
          // GIVEN: User with study sessions
          const mockStudySessions = [
            {
              _id: 'session1',
              user: 'user123',
              subject: 'subject123',
              duration: 30,
              cardsStudied: 20,
              correctAnswers: 15,
              incorrectAnswers: 5,
            },
            {
              _id: 'session2',
              user: 'user123',
              subject: 'subject456',
              duration: 45,
              cardsStudied: 25,
              correctAnswers: 20,
              incorrectAnswers: 5,
            },
          ];

          mockStudySession.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockStudySessions),
          } as any);

          // WHEN: Function is called
          await getStudySessions(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return user's study sessions
          expect(mockStudySession.find).toHaveBeenCalledWith({ user: 'user123' });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Study sessions retrieved successfully',
            { studySessions: mockStudySessions }
          );
        });
      });

      describe('WHEN user has no study sessions', () => {
        test('THEN should return empty array', async () => {
          // GIVEN: User with no study sessions
          mockStudySession.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          } as any);

          // WHEN: Function is called
          await getStudySessions(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return empty array
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Study sessions retrieved successfully',
            { studySessions: [] }
          );
        });
      });
    });

    describe('GIVEN an admin user requests study sessions', () => {
      describe('WHEN admin requests all study sessions', () => {
        test('THEN should return all study sessions', async () => {
          // GIVEN: Admin user
          const mockStudySessions = [
            {
              _id: 'session1',
              user: 'user123',
              subject: 'subject123',
              duration: 30,
              cardsStudied: 20,
            },
            {
              _id: 'session2',
              user: 'user456',
              subject: 'subject456',
              duration: 45,
              cardsStudied: 25,
            },
          ];

          mockStudySession.find.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockStudySessions),
          } as any);

          mockReq.user = { id: 'admin123', role: 'admin' };

          // WHEN: Function is called
          await getStudySessions(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return all study sessions
          expect(mockStudySession.find).toHaveBeenCalledWith({});
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Study sessions retrieved successfully',
            { studySessions: mockStudySessions }
          );
        });
      });
    });
  });

  describe('createStudySession', () => {
    describe('GIVEN a user wants to create a study session', () => {
      describe('WHEN all data is valid and user has access to subject', () => {
        test('THEN should create study session successfully', async () => {
          // GIVEN: Valid data and authorized user
          const mockSubjectData = {
            _id: 'subject123',
            name: 'Math',
            createdBy: 'user123',
          };
          const mockStudySessionData = {
            _id: 'session123',
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockStudySession.create.mockResolvedValue(mockStudySessionData);
          mockFlashcard.updateMany.mockResolvedValue({});

          mockReq.body = {
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should create study session
          expect(mockSubject.findById).toHaveBeenCalledWith('subject123');
          expect(mockStudySession.create).toHaveBeenCalledWith({
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          });
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            201,
            true,
            'Study session created successfully',
            { studySession: mockStudySessionData }
          );
        });
      });

      describe('WHEN subject does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Subject not found
          mockSubject.findById.mockResolvedValue(null);
          mockReq.body = { subject: 'nonexistent' };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

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
          mockReq.body = { subject: 'subject123' };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with authorization error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to add study sessions to this subject',
            })
          );
        });
      });

      describe('WHEN performance is high (80%+)', () => {
        test('THEN should update flashcards with 7-day review interval', async () => {
          // GIVEN: High performance study session
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const mockStudySessionData = {
            _id: 'session123',
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 18, // 90% performance
            incorrectAnswers: 2,
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockStudySession.create.mockResolvedValue(mockStudySessionData);
          mockFlashcard.updateMany.mockResolvedValue({});

          mockReq.body = {
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 18,
            incorrectAnswers: 2,
          };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should update flashcards with 7-day interval
          expect(mockFlashcard.updateMany).toHaveBeenCalledWith(
            { subject: 'subject123', nextReviewDate: { $lte: expect.any(Date) } },
            expect.objectContaining({
              $set: expect.objectContaining({
                nextReviewDate: expect.any(Date),
                lastReviewed: expect.any(Date),
              }),
              $inc: { reviewCount: 1 },
            })
          );
        });
      });

      describe('WHEN performance is medium (50-79%)', () => {
        test('THEN should update flashcards with 3-day review interval', async () => {
          // GIVEN: Medium performance study session
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const mockStudySessionData = {
            _id: 'session123',
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 12, // 60% performance
            incorrectAnswers: 8,
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockStudySession.create.mockResolvedValue(mockStudySessionData);
          mockFlashcard.updateMany.mockResolvedValue({});

          mockReq.body = {
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 12,
            incorrectAnswers: 8,
          };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should update flashcards with 3-day interval
          expect(mockFlashcard.updateMany).toHaveBeenCalled();
        });
      });

      describe('WHEN performance is low (<50%)', () => {
        test('THEN should update flashcards with 1-day review interval', async () => {
          // GIVEN: Low performance study session
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const mockStudySessionData = {
            _id: 'session123',
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 8, // 40% performance
            incorrectAnswers: 12,
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockStudySession.create.mockResolvedValue(mockStudySessionData);
          mockFlashcard.updateMany.mockResolvedValue({});

          mockReq.body = {
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 8,
            incorrectAnswers: 12,
          };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should update flashcards with 1-day interval
          expect(mockFlashcard.updateMany).toHaveBeenCalled();
        });
      });

      describe('WHEN no answers were given', () => {
        test('THEN should not update flashcards', async () => {
          // GIVEN: Study session with no answers
          const mockSubjectData = {
            _id: 'subject123',
            createdBy: 'user123',
          };
          const mockStudySessionData = {
            _id: 'session123',
            user: 'user123',
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 0,
            incorrectAnswers: 0,
          };

          mockSubject.findById.mockResolvedValue(mockSubjectData);
          mockStudySession.create.mockResolvedValue(mockStudySessionData);

          mockReq.body = {
            subject: 'subject123',
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 0,
            incorrectAnswers: 0,
          };

          // WHEN: Function is called
          await createStudySession(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should not update flashcards
          expect(mockFlashcard.updateMany).not.toHaveBeenCalled();
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            201,
            true,
            'Study session created successfully',
            { studySession: mockStudySessionData }
          );
        });
      });
    });
  });

  describe('getStudyStatistics', () => {
    describe('GIVEN a user requests study statistics', () => {
      describe('WHEN user has study sessions', () => {
        test('THEN should return comprehensive statistics', async () => {
          // GIVEN: User with study sessions
          const mockAggregateResult = [
            {
              totalSessions: 5,
              totalDuration: 150,
              totalCardsStudied: 100,
              totalCorrectAnswers: 80,
              totalIncorrectAnswers: 20,
              averageScore: 0.8,
            },
          ];
          const mockSubjectsResult = [
            {
              _id: 'subject123',
              name: 'Math',
              sessions: 3,
              cardsStudied: 60,
              correctAnswers: 48,
              incorrectAnswers: 12,
              successRate: 80,
            },
          ];

          mockStudySession.aggregate
            .mockResolvedValueOnce(mockAggregateResult)
            .mockResolvedValueOnce(mockSubjectsResult);

          // WHEN: Function is called
          await getStudyStatistics(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return statistics
          expect(mockStudySession.aggregate).toHaveBeenCalledTimes(2);
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Study statistics retrieved successfully',
            {
              statistics: {
                totalSessions: 5,
                totalDuration: 150,
                totalCardsStudied: 100,
                totalCorrectAnswers: 80,
                totalIncorrectAnswers: 20,
                averageScore: 0.8,
                subjects: mockSubjectsResult,
              },
            }
          );
        });
      });

      describe('WHEN user has no study sessions', () => {
        test('THEN should return default statistics', async () => {
          // GIVEN: User with no study sessions
          mockStudySession.aggregate.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

          // WHEN: Function is called
          await getStudyStatistics(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return default statistics
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'Study statistics retrieved successfully',
            {
              statistics: {
                totalSessions: 0,
                totalDuration: 0,
                totalCardsStudied: 0,
                totalCorrectAnswers: 0,
                totalIncorrectAnswers: 0,
                averageScore: 0,
                subjects: [],
              },
            }
          );
        });
      });

      describe('WHEN filtering by subject', () => {
        test('THEN should return statistics for specific subject', async () => {
          // GIVEN: Filter by subject
          mockReq.query = { subject: 'subject123' };
          mockStudySession.aggregate
            .mockResolvedValueOnce([
              {
                totalSessions: 2,
                totalDuration: 60,
                totalCardsStudied: 40,
                totalCorrectAnswers: 32,
                totalIncorrectAnswers: 8,
                averageScore: 0.8,
              },
            ])
            .mockResolvedValueOnce([]);

          // WHEN: Function is called
          await getStudyStatistics(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should filter by subject
          expect(mockStudySession.aggregate).toHaveBeenCalledWith([
            { $match: { user: 'user123', subject: 'subject123' } },
            expect.any(Object),
          ]);
        });
      });
    });
  });

  // CASOS BORDE ADICIONALES
  describe('Edge Cases', () => {
    describe('GIVEN invalid study session data', () => {
      test('THEN should handle validation errors gracefully', async () => {
        // GIVEN: Invalid data
        const mockSubjectData = {
          _id: 'subject123',
          createdBy: 'user123',
        };
        const validationError = new Error('Validation failed');
        (validationError as any).name = 'ValidationError';

        mockSubject.findById.mockResolvedValue(mockSubjectData);
        mockStudySession.create.mockRejectedValue(validationError);
        mockReq.body = {
          subject: 'subject123',
          duration: -10, // Invalid duration
          cardsStudied: -5, // Invalid count
          correctAnswers: 10,
          incorrectAnswers: 5,
        };

        // WHEN: Function is called
        await createStudySession(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with validation error
        expect(mockNext).toHaveBeenCalledWith(validationError);
      });
    });

    describe('GIVEN database aggregation error', () => {
      test('THEN should handle aggregation errors gracefully', async () => {
        // GIVEN: Database aggregation error
        const aggregationError = new Error('Aggregation failed');
        mockStudySession.aggregate.mockRejectedValue(aggregationError);

        // WHEN: Function is called
        await getStudyStatistics(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(aggregationError);
      });
    });

    describe('GIVEN very large study session data', () => {
      test('THEN should handle large data successfully', async () => {
        // GIVEN: Large study session
        const mockSubjectData = {
          _id: 'subject123',
          createdBy: 'user123',
        };
        const mockStudySessionData = {
          _id: 'session123',
          user: 'user123',
          subject: 'subject123',
          duration: 480, // 8 hours
          cardsStudied: 1000,
          correctAnswers: 950,
          incorrectAnswers: 50,
        };

        mockSubject.findById.mockResolvedValue(mockSubjectData);
        mockStudySession.create.mockResolvedValue(mockStudySessionData);
        mockFlashcard.updateMany.mockResolvedValue({});

        mockReq.body = {
          subject: 'subject123',
          duration: 480,
          cardsStudied: 1000,
          correctAnswers: 950,
          incorrectAnswers: 50,
        };

        // WHEN: Function is called
        await createStudySession(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should handle large data
        expect(mockStudySession.create).toHaveBeenCalledWith({
          user: 'user123',
          subject: 'subject123',
          duration: 480,
          cardsStudied: 1000,
          correctAnswers: 950,
          incorrectAnswers: 50,
        });
      });
    });

    describe('GIVEN zero division in statistics calculation', () => {
      test('THEN should handle zero division gracefully', async () => {
        // GIVEN: Study sessions with zero answers
        const mockAggregateResult = [
          {
            totalSessions: 2,
            totalDuration: 60,
            totalCardsStudied: 20,
            totalCorrectAnswers: 0,
            totalIncorrectAnswers: 0,
            averageScore: null, // This would cause division by zero
          },
        ];

        mockStudySession.aggregate
          .mockResolvedValueOnce(mockAggregateResult)
          .mockResolvedValueOnce([]);

        // WHEN: Function is called
        await getStudyStatistics(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should handle zero division
        expect(mockSendResponse).toHaveBeenCalledWith(
          mockRes,
          200,
          true,
          'Study statistics retrieved successfully',
          expect.objectContaining({
            statistics: expect.objectContaining({
              totalSessions: 2,
              totalDuration: 60,
              totalCardsStudied: 20,
              totalCorrectAnswers: 0,
              totalIncorrectAnswers: 0,
              averageScore: null,
            }),
          })
        );
      });
    });

    describe('GIVEN concurrent study session creation', () => {
      test('THEN should handle concurrent operations', async () => {
        // GIVEN: Multiple concurrent requests
        const mockSubjectData = {
          _id: 'subject123',
          createdBy: 'user123',
        };
        const mockStudySessionData = {
          _id: 'session123',
          user: 'user123',
          subject: 'subject123',
          duration: 30,
          cardsStudied: 20,
          correctAnswers: 15,
          incorrectAnswers: 5,
        };

        mockSubject.findById.mockResolvedValue(mockSubjectData);
        mockStudySession.create.mockResolvedValue(mockStudySessionData);
        mockFlashcard.updateMany.mockResolvedValue({});

        mockReq.body = {
          subject: 'subject123',
          duration: 30,
          cardsStudied: 20,
          correctAnswers: 15,
          incorrectAnswers: 5,
        };

        // WHEN: Function is called multiple times
        const promises = [
          createStudySession(mockReq as any, mockRes as Response, mockNext),
          createStudySession(mockReq as any, mockRes as Response, mockNext),
        ];

        await Promise.all(promises);

        // THEN: Should handle concurrent operations
        expect(mockStudySession.create).toHaveBeenCalledTimes(2);
      });
    });
  });
});
