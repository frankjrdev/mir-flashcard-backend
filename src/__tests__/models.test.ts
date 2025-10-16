import mongoose from 'mongoose';
import User from '../models/User';
import Subject from '../models/Subject';
import Flashcard from '../models/Flashcard';
import StudySession from '../models/StudySession';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Models', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    // Clean up database
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Model', () => {
    describe('GIVEN a new user is created', () => {
      describe('WHEN all required fields are provided', () => {
        test('THEN should create user successfully', async () => {
          // GIVEN: Valid user data
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user',
          };

          // WHEN: User is created
          const user = new User(userData);
          await user.save();

          // THEN: Should create user with correct data
          expect(user.name).toBe('John Doe');
          expect(user.email).toBe('john@example.com');
          expect(user.role).toBe('user');
          expect(user._id).toBeDefined();
          expect(user.createdAt).toBeDefined();
          expect(user.updatedAt).toBeDefined();
        });
      });

      describe('WHEN name is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: User data without name
          const userData = {
            email: 'john@example.com',
            password: 'password123',
          };

          // WHEN: User is created
          const user = new User(userData);

          // THEN: Should throw validation error
          await expect(user.save()).rejects.toThrow('Please add a name');
        });
      });

      describe('WHEN email is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: User data without email
          const userData = {
            name: 'John Doe',
            password: 'password123',
          };

          // WHEN: User is created
          const user = new User(userData);

          // THEN: Should throw validation error
          await expect(user.save()).rejects.toThrow('Please add an email');
        });
      });

      describe('WHEN password is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: User data without password
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
          };

          // WHEN: User is created
          const user = new User(userData);

          // THEN: Should throw validation error
          await expect(user.save()).rejects.toThrow('Please add a password');
        });
      });

      describe('WHEN email format is invalid', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: User data with invalid email
          const userData = {
            name: 'John Doe',
            email: 'invalid-email',
            password: 'password123',
          };

          // WHEN: User is created
          const user = new User(userData);

          // THEN: Should throw validation error
          await expect(user.save()).rejects.toThrow('Please add a valid email');
        });
      });

      describe('WHEN password is too short', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: User data with short password
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: '123',
          };

          // WHEN: User is created
          const user = new User(userData);

          // THEN: Should throw validation error
          await expect(user.save()).rejects.toThrow(
            'Path `password` is shorter than the minimum allowed length'
          );
        });
      });

      describe('WHEN email already exists', () => {
        test('THEN should throw duplicate key error', async () => {
          // GIVEN: Existing user
          const existingUser = new User({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'password123',
          });
          await existingUser.save();

          // WHEN: Another user with same email is created
          const duplicateUser = new User({
            name: 'Duplicate User',
            email: 'existing@example.com',
            password: 'password123',
          });

          // THEN: Should throw duplicate key error
          await expect(duplicateUser.save()).rejects.toThrow('duplicate key error');
        });
      });

      describe('WHEN role is not specified', () => {
        test('THEN should default to user role', async () => {
          // GIVEN: User data without role
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          };

          // WHEN: User is created
          const user = new User(userData);
          await user.save();

          // THEN: Should default to user role
          expect(user.role).toBe('user');
        });
      });

      describe('WHEN role is admin', () => {
        test('THEN should create admin user', async () => {
          // GIVEN: User data with admin role
          const userData = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
          };

          // WHEN: User is created
          const user = new User(userData);
          await user.save();

          // THEN: Should create admin user
          expect(user.role).toBe('admin');
        });
      });
    });

    describe('GIVEN password hashing', () => {
      describe('WHEN user is saved', () => {
        test('THEN should hash password before saving', async () => {
          // GIVEN: User with password
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          };

          // Mock bcrypt
          mockBcrypt.genSalt.mockResolvedValue('salt' as any);
          mockBcrypt.hash.mockResolvedValue('hashedPassword' as any);

          // WHEN: User is saved
          const user = new User(userData);
          await user.save();

          // THEN: Should hash password
          expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
          expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
        });
      });

      describe('WHEN password is not modified', () => {
        test('THEN should not hash password again', async () => {
          // GIVEN: Existing user
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          // Clear mocks
          jest.clearAllMocks();

          // WHEN: User is updated without password change
          user.name = 'Updated Name';
          await user.save();

          // THEN: Should not hash password
          expect(mockBcrypt.genSalt).not.toHaveBeenCalled();
          expect(mockBcrypt.hash).not.toHaveBeenCalled();
        });
      });
    });

    describe('GIVEN JWT token generation', () => {
      describe('WHEN getSignedJwtToken is called', () => {
        test('THEN should generate JWT token', () => {
          // GIVEN: User with ID
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          user._id = 'user123';

          // Mock JWT
          mockJwt.sign.mockReturnValue('mock-jwt-token' as any);

          // WHEN: getSignedJwtToken is called
          const token = user.getSignedJwtToken();

          // THEN: Should generate JWT token
          expect(mockJwt.sign).toHaveBeenCalledWith({ id: 'user123' }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
          });
          expect(token).toBe('mock-jwt-token');
        });
      });
    });

    describe('GIVEN password comparison', () => {
      describe('WHEN comparePassword is called with correct password', () => {
        test('THEN should return true', async () => {
          // GIVEN: User with hashed password
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedPassword',
          });

          // Mock bcrypt compare
          mockBcrypt.compare.mockResolvedValue(true as any);

          // WHEN: comparePassword is called
          const result = await user.comparePassword('password123');

          // THEN: Should return true
          expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
          expect(result).toBe(true);
        });
      });

      describe('WHEN comparePassword is called with incorrect password', () => {
        test('THEN should return false', async () => {
          // GIVEN: User with hashed password
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedPassword',
          });

          // Mock bcrypt compare
          mockBcrypt.compare.mockResolvedValue(false as any);

          // WHEN: comparePassword is called
          const result = await user.comparePassword('wrongpassword');

          // THEN: Should return false
          expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
          expect(result).toBe(false);
        });
      });
    });
  });

  describe('Subject Model', () => {
    describe('GIVEN a new subject is created', () => {
      describe('WHEN all required fields are provided', () => {
        test('THEN should create subject successfully', async () => {
          // GIVEN: Valid subject data
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subjectData = {
            name: 'Mathematics',
            description: 'Math subject',
            createdBy: user._id,
          };

          // WHEN: Subject is created
          const subject = new Subject(subjectData);
          await subject.save();

          // THEN: Should create subject with correct data
          expect(subject.name).toBe('Mathematics');
          expect(subject.description).toBe('Math subject');
          expect(subject.createdBy.toString()).toBe(user._id.toString());
          expect(subject._id).toBeDefined();
          expect(subject.createdAt).toBeDefined();
          expect(subject.updatedAt).toBeDefined();
        });
      });

      describe('WHEN name is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Subject data without name
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subjectData = {
            description: 'Math subject',
            createdBy: user._id,
          };

          // WHEN: Subject is created
          const subject = new Subject(subjectData);

          // THEN: Should throw validation error
          await expect(subject.save()).rejects.toThrow('Please add a subject name');
        });
      });

      describe('WHEN createdBy is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Subject data without createdBy
          const subjectData = {
            name: 'Mathematics',
            description: 'Math subject',
          };

          // WHEN: Subject is created
          const subject = new Subject(subjectData);

          // THEN: Should throw validation error
          await expect(subject.save()).rejects.toThrow('Path `createdBy` is required');
        });
      });

      describe('WHEN description is not provided', () => {
        test('THEN should create subject without description', async () => {
          // GIVEN: Subject data without description
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subjectData = {
            name: 'Mathematics',
            createdBy: user._id,
          };

          // WHEN: Subject is created
          const subject = new Subject(subjectData);
          await subject.save();

          // THEN: Should create subject without description
          expect(subject.name).toBe('Mathematics');
          expect(subject.description).toBeUndefined();
        });
      });
    });
  });

  describe('Flashcard Model', () => {
    describe('GIVEN a new flashcard is created', () => {
      describe('WHEN all required fields are provided', () => {
        test('THEN should create flashcard successfully', async () => {
          // GIVEN: Valid flashcard data
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const flashcardData = {
            question: 'What is 2+2?',
            answer: '4',
            subject: subject._id,
            createdBy: user._id,
            difficulty: 'easy',
          };

          // WHEN: Flashcard is created
          const flashcard = new Flashcard(flashcardData);
          await flashcard.save();

          // THEN: Should create flashcard with correct data
          expect(flashcard.question).toBe('What is 2+2?');
          expect(flashcard.answer).toBe('4');
          expect(flashcard.subject.toString()).toBe(subject._id.toString());
          expect(flashcard.createdBy.toString()).toBe(user._id.toString());
          expect(flashcard.difficulty).toBe('easy');
          expect(flashcard.reviewCount).toBe(0);
          expect(flashcard.nextReviewDate).toBeDefined();
          expect(flashcard._id).toBeDefined();
        });
      });

      describe('WHEN question is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Flashcard data without question
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const flashcardData = {
            answer: '4',
            subject: subject._id,
            createdBy: user._id,
          };

          // WHEN: Flashcard is created
          const flashcard = new Flashcard(flashcardData);

          // THEN: Should throw validation error
          await expect(flashcard.save()).rejects.toThrow('Please add a question');
        });
      });

      describe('WHEN answer is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Flashcard data without answer
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const flashcardData = {
            question: 'What is 2+2?',
            subject: subject._id,
            createdBy: user._id,
          };

          // WHEN: Flashcard is created
          const flashcard = new Flashcard(flashcardData);

          // THEN: Should throw validation error
          await expect(flashcard.save()).rejects.toThrow('Please add an answer');
        });
      });

      describe('WHEN difficulty is not specified', () => {
        test('THEN should default to medium difficulty', async () => {
          // GIVEN: Flashcard data without difficulty
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const flashcardData = {
            question: 'What is 2+2?',
            answer: '4',
            subject: subject._id,
            createdBy: user._id,
          };

          // WHEN: Flashcard is created
          const flashcard = new Flashcard(flashcardData);
          await flashcard.save();

          // THEN: Should default to medium difficulty
          expect(flashcard.difficulty).toBe('medium');
        });
      });

      describe('WHEN difficulty is invalid', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Flashcard data with invalid difficulty
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const flashcardData = {
            question: 'What is 2+2?',
            answer: '4',
            subject: subject._id,
            createdBy: user._id,
            difficulty: 'invalid',
          };

          // WHEN: Flashcard is created
          const flashcard = new Flashcard(flashcardData);

          // THEN: Should throw validation error
          await expect(flashcard.save()).rejects.toThrow('`invalid` is not a valid enum value');
        });
      });
    });
  });

  describe('StudySession Model', () => {
    describe('GIVEN a new study session is created', () => {
      describe('WHEN all required fields are provided', () => {
        test('THEN should create study session successfully', async () => {
          // GIVEN: Valid study session data
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            user: user._id,
            subject: subject._id,
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);
          await studySession.save();

          // THEN: Should create study session with correct data
          expect(studySession.user.toString()).toBe(user._id.toString());
          expect(studySession.subject.toString()).toBe(subject._id.toString());
          expect(studySession.duration).toBe(30);
          expect(studySession.cardsStudied).toBe(20);
          expect(studySession.correctAnswers).toBe(15);
          expect(studySession.incorrectAnswers).toBe(5);
          expect(studySession._id).toBeDefined();
          expect(studySession.createdAt).toBeDefined();
          expect(studySession.updatedAt).toBeDefined();
        });
      });

      describe('WHEN user is missing', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Study session data without user
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            subject: subject._id,
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);

          // THEN: Should throw validation error
          await expect(studySession.save()).rejects.toThrow('Path `user` is required');
        });
      });

      describe('WHEN duration is negative', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Study session data with negative duration
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            user: user._id,
            subject: subject._id,
            duration: -10,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);

          // THEN: Should throw validation error
          await expect(studySession.save()).rejects.toThrow(
            'Path `duration` (-10) is less than minimum allowed value'
          );
        });
      });

      describe('WHEN cardsStudied is negative', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Study session data with negative cardsStudied
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            user: user._id,
            subject: subject._id,
            duration: 30,
            cardsStudied: -5,
            correctAnswers: 15,
            incorrectAnswers: 5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);

          // THEN: Should throw validation error
          await expect(studySession.save()).rejects.toThrow(
            'Path `cardsStudied` (-5) is less than minimum allowed value'
          );
        });
      });

      describe('WHEN correctAnswers is negative', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Study session data with negative correctAnswers
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            user: user._id,
            subject: subject._id,
            duration: 30,
            cardsStudied: 20,
            correctAnswers: -5,
            incorrectAnswers: 5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);

          // THEN: Should throw validation error
          await expect(studySession.save()).rejects.toThrow(
            'Path `correctAnswers` (-5) is less than minimum allowed value'
          );
        });
      });

      describe('WHEN incorrectAnswers is negative', () => {
        test('THEN should throw validation error', async () => {
          // GIVEN: Study session data with negative incorrectAnswers
          const user = new User({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          });
          await user.save();

          const subject = new Subject({
            name: 'Mathematics',
            createdBy: user._id,
          });
          await subject.save();

          const studySessionData = {
            user: user._id,
            subject: subject._id,
            duration: 30,
            cardsStudied: 20,
            correctAnswers: 15,
            incorrectAnswers: -5,
          };

          // WHEN: Study session is created
          const studySession = new StudySession(studySessionData);

          // THEN: Should throw validation error
          await expect(studySession.save()).rejects.toThrow(
            'Path `incorrectAnswers` (-5) is less than minimum allowed value'
          );
        });
      });
    });
  });

  // CASOS BORDE ADICIONALES
  describe('Edge Cases', () => {
    describe('GIVEN very long text fields', () => {
      test('THEN should handle long text gracefully', async () => {
        // GIVEN: Very long text
        const longText = 'A'.repeat(10000);
        const user = new User({
          name: longText,
          email: 'john@example.com',
          password: 'password123',
        });

        // WHEN: User is saved
        // THEN: Should handle long text
        await expect(user.save()).resolves.toBeDefined();
      });
    });

    describe('GIVEN special characters in fields', () => {
      test('THEN should handle special characters', async () => {
        // GIVEN: Text with special characters
        const specialText = 'Test @#$%^&*()_+-=[]{}|;:,.<>?';
        const user = new User({
          name: specialText,
          email: 'test@example.com',
          password: 'password123',
        });

        // WHEN: User is saved
        // THEN: Should handle special characters
        await expect(user.save()).resolves.toBeDefined();
      });
    });

    describe('GIVEN unicode characters', () => {
      test('THEN should handle unicode characters', async () => {
        // GIVEN: Text with unicode characters
        const unicodeText = 'Test 中文 العربية русский';
        const user = new User({
          name: unicodeText,
          email: 'test@example.com',
          password: 'password123',
        });

        // WHEN: User is saved
        // THEN: Should handle unicode characters
        await expect(user.save()).resolves.toBeDefined();
      });
    });

    describe('GIVEN concurrent model operations', () => {
      test('THEN should handle concurrent operations', async () => {
        // GIVEN: Multiple concurrent operations
        const user1 = new User({
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
        });
        const user2 = new User({
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
        });

        // WHEN: Users are saved concurrently
        const promises = [user1.save(), user2.save()];

        // THEN: Should handle concurrent operations
        await expect(Promise.all(promises)).resolves.toBeDefined();
      });
    });

    describe('GIVEN model with circular references', () => {
      test('THEN should handle circular references', async () => {
        // GIVEN: Model with potential circular reference
        const user = new User({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });
        await user.save();

        const subject = new Subject({
          name: 'Mathematics',
          createdBy: user._id,
        });
        await subject.save();

        // WHEN: Models are related
        // THEN: Should handle circular references
        expect(subject.createdBy.toString()).toBe(user._id.toString());
      });
    });
  });
});
