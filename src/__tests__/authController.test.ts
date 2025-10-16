import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { register, login, getMe } from '../controllers/authController';
import { protect, authorize } from '../middlewares/auth';
import User, { IUser } from '../models/User';
import sendResponse from '../utils/responseHandler';
import { Document, ObjectId } from 'mongoose';

// Mock de las dependencias
jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('../utils/responseHandler');

const mockUser = User as jest.Mocked<typeof User>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockSendResponse = sendResponse as jest.MockedFunction<typeof sendResponse>;

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {

    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    describe('GIVEN a user wants to register', () => {
      describe('WHEN all data is valid', () => {
        test('THEN should create user and return token', async () => {
          // GIVEN: Valid registration data
          const mockUserData = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedpassword123',
            role: 'user' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            comparePassword: jest.fn().mockResolvedValue(true),
            getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-token'),
            save: jest.fn(),
            $set: jest.fn(),
            $isNew: false,
          } as unknown as Document<unknown, {}, IUser> & IUser & { _id: ObjectId };

          mockUser.create.mockResolvedValue(mockUserData as any);
          mockReq.body = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          };

          // WHEN: Function is called
          await register(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should create user and return token
          expect(mockUser.create).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'user',
          });
          expect(mockUserData.getSignedJwtToken).toHaveBeenCalled();
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'User registered successfully',
            {
              token: 'mock-jwt-token',
              user: {
                id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user',
              },
            }
          );
        });
      });

      describe('WHEN email already exists', () => {
        test('THEN should call next with duplicate error', async () => {
          // GIVEN: Duplicate email
          const duplicateError = new Error('Duplicate field value: email');
          (duplicateError as any).code = 11000;
          (duplicateError as any).keyValue = { email: 'john@example.com' };

          mockUser.create.mockRejectedValue(duplicateError);
          mockReq.body = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
          };

          // WHEN: Function is called
          await register(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with duplicate error
          expect(mockNext).toHaveBeenCalledWith(duplicateError);
        });
      });

      describe('WHEN validation fails', () => {
        test('THEN should call next with validation error', async () => {
          // GIVEN: Invalid data
          const validationError = new Error('Validation failed');
          (validationError as any).name = 'ValidationError';
          (validationError as any).errors = {
            email: { message: 'Please add a valid email' },
          };

          mockUser.create.mockRejectedValue(validationError);
          mockReq.body = {
            name: 'John Doe',
            email: 'invalid-email',
            password: '123', // Too short
          };

          // WHEN: Function is called
          await register(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with validation error
          expect(mockNext).toHaveBeenCalledWith(validationError);
        });
      });

      describe('WHEN required fields are missing', () => {
        test('THEN should handle missing fields gracefully', async () => {
          // GIVEN: Missing required fields
          const validationError = new Error('Validation failed');
          (validationError as any).name = 'ValidationError';

          mockUser.create.mockRejectedValue(validationError);
          mockReq.body = {
            name: 'John Doe',
            // Missing email and password
          };

          // WHEN: Function is called
          await register(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with validation error
          expect(mockNext).toHaveBeenCalledWith(validationError);
        });
      });
    });
  });

  describe('login', () => {
    describe('GIVEN a user wants to login', () => {
      describe('WHEN credentials are valid', () => {
        test('THEN should authenticate user and return token', async () => {
          // GIVEN: Valid credentials
          const mockUserData = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            comparePassword: jest.fn().mockResolvedValue(true),
            getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-token'),
          };

          mockUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUserData),
          } as any);

          mockReq.body = {
            email: 'john@example.com',
            password: 'password123',
          };

          // WHEN: Function is called
          await login(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should authenticate user
          expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
          expect(mockUserData.comparePassword).toHaveBeenCalledWith('password123');
          expect(mockUserData.getSignedJwtToken).toHaveBeenCalled();
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'User logged in successfully',
            {
              token: 'mock-jwt-token',
              user: {
                id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user',
              },
            }
          );
        });
      });

      describe('WHEN email is missing', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Missing email
          mockReq.body = {
            password: 'password123',
          };

          // WHEN: Function is called
          await login(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Please provide an email and password',
            })
          );
        });
      });

      describe('WHEN password is missing', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Missing password
          mockReq.body = {
            email: 'john@example.com',
          };

          // WHEN: Function is called
          await login(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Please provide an email and password',
            })
          );
        });
      });

      describe('WHEN user does not exist', () => {
        test('THEN should call next with invalid credentials error', async () => {
          // GIVEN: User not found
          mockUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
          } as any);

          mockReq.body = {
            email: 'nonexistent@example.com',
            password: 'password123',
          };

          // WHEN: Function is called
          await login(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Invalid credentials',
            })
          );
        });
      });

      describe('WHEN password is incorrect', () => {
        test('THEN should call next with invalid credentials error', async () => {
          // GIVEN: Incorrect password
          const mockUserData = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            comparePassword: jest.fn().mockResolvedValue(false),
          };

          mockUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUserData),
          } as any);

          mockReq.body = {
            email: 'john@example.com',
            password: 'wrongpassword',
          };

          // WHEN: Function is called
          await login(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Invalid credentials',
            })
          );
        });
      });
    });
  });

  describe('getMe', () => {
    describe('GIVEN an authenticated user requests their data', () => {
      describe('WHEN user exists', () => {
        test('THEN should return user data', async () => {
          // GIVEN: Authenticated user
          const mockUserData = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
          };

          mockUser.findById.mockResolvedValue(mockUserData);
          mockReq.user = { id: 'user123' };

          // WHEN: Function is called
          await getMe(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return user data
          expect(mockUser.findById).toHaveBeenCalledWith('user123');
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'User data retrieved successfully',
            {
              id: 'user123',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'user',
            }
          );
        });
      });

      describe('WHEN user does not exist', () => {
        test('THEN should return null values', async () => {
          // GIVEN: User not found
          mockUser.findById.mockResolvedValue(null);
          mockReq.user = { id: 'nonexistent' };

          // WHEN: Function is called
          await getMe(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should return null values
          expect(mockSendResponse).toHaveBeenCalledWith(
            mockRes,
            200,
            true,
            'User data retrieved successfully',
            {
              id: undefined,
              name: undefined,
              email: undefined,
              role: undefined,
            }
          );
        });
      });
    });
  });
});

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    describe('GIVEN a request with valid Bearer token', () => {
      describe('WHEN token is valid and user exists', () => {
        test('THEN should authenticate user and call next', async () => {
          // GIVEN: Valid token and user
          const mockUserData = {
            _id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
          };

          mockJwt.verify.mockReturnValue({ id: 'user123' });
          mockUser.findById.mockResolvedValue(mockUserData);
          mockReq.headers = {
            authorization: 'Bearer valid-token',
          };

          // WHEN: Middleware is called
          await protect(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should authenticate user
          expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
          expect(mockUser.findById).toHaveBeenCalledWith('user123');
          expect(mockReq.user).toEqual(mockUserData);
          expect(mockNext).toHaveBeenCalled();
        });
      });

      describe('WHEN token is invalid', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Invalid token
          mockJwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
          });
          mockReq.headers = {
            authorization: 'Bearer invalid-token',
          };

          // WHEN: Middleware is called
          await protect(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this route',
            })
          );
        });
      });

      describe('WHEN user does not exist', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Valid token but user not found
          mockJwt.verify.mockReturnValue({ id: 'nonexistent' });
          mockUser.findById.mockResolvedValue(null);
          mockReq.headers = {
            authorization: 'Bearer valid-token',
          };

          // WHEN: Middleware is called
          await protect(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this route',
            })
          );
        });
      });
    });

    describe('GIVEN a request without token', () => {
      describe('WHEN no authorization header', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: No authorization header
          mockReq.headers = {};

          // WHEN: Middleware is called
          await protect(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this route',
            })
          );
        });
      });

      describe('WHEN authorization header does not start with Bearer', () => {
        test('THEN should call next with error', async () => {
          // GIVEN: Invalid authorization format
          mockReq.headers = {
            authorization: 'Basic token',
          };

          // WHEN: Middleware is called
          await protect(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Not authorized to access this route',
            })
          );
        });
      });
    });
  });

  describe('authorize middleware', () => {
    describe('GIVEN a user with specific role', () => {
      describe('WHEN user role is authorized', () => {
        test('THEN should call next', () => {
          // GIVEN: Authorized user
          mockReq.user = { id: 'user123', role: 'admin' };
          const authorizeAdmin = authorize('admin', 'user');

          // WHEN: Middleware is called
          authorizeAdmin(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next
          expect(mockNext).toHaveBeenCalled();
        });
      });

      describe('WHEN user role is not authorized', () => {
        test('THEN should call next with error', () => {
          // GIVEN: Unauthorized user
          mockReq.user = { id: 'user123', role: 'user' };
          const authorizeAdmin = authorize('admin');

          // WHEN: Middleware is called
          authorizeAdmin(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next with error
          expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'User role user is not authorized to access this route',
            })
          );
        });
      });

      describe('WHEN multiple roles are authorized', () => {
        test('THEN should allow any of the authorized roles', () => {
          // GIVEN: User with one of the authorized roles
          mockReq.user = { id: 'user123', role: 'user' };
          const authorizeMultiple = authorize('admin', 'user', 'moderator');

          // WHEN: Middleware is called
          authorizeMultiple(mockReq as any, mockRes as Response, mockNext);

          // THEN: Should call next
          expect(mockNext).toHaveBeenCalled();
        });
      });
    });
  });

  // CASOS BORDE ADICIONALES
  describe('Edge Cases', () => {
    describe('GIVEN malformed JWT token', () => {
      test('THEN should handle JWT malformed error', async () => {
        // GIVEN: Malformed JWT
        mockJwt.verify.mockImplementation(() => {
          throw new Error('jwt malformed');
        });
        mockReq.headers = {
          authorization: 'Bearer malformed-token',
        };

        // WHEN: Middleware is called
        await protect(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Not authorized to access this route',
          })
        );
      });
    });

    describe('GIVEN expired JWT token', () => {
      test('THEN should handle JWT expired error', async () => {
        // GIVEN: Expired JWT
        mockJwt.verify.mockImplementation(() => {
          throw new Error('jwt expired');
        });
        mockReq.headers = {
          authorization: 'Bearer expired-token',
        };

        // WHEN: Middleware is called
        await protect(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Not authorized to access this route',
          })
        );
      });
    });

    describe('GIVEN very long authorization header', () => {
      test('THEN should handle long token gracefully', async () => {
        // GIVEN: Very long token
        const longToken = 'a'.repeat(10000);
        const mockUserData = {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        };

        mockJwt.verify.mockReturnValue({ id: 'user123' });
        mockUser.findById.mockResolvedValue(mockUserData);
        mockReq.headers = {
          authorization: `Bearer ${longToken}`,
        };

        // WHEN: Middleware is called
        await protect(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should handle long token
        expect(mockJwt.verify).toHaveBeenCalledWith(longToken, process.env.JWT_SECRET);
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('GIVEN concurrent authentication requests', () => {
      test('THEN should handle concurrent requests', async () => {
        // GIVEN: Multiple concurrent requests
        const mockUserData = {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        };

        mockJwt.verify.mockReturnValue({ id: 'user123' });
        mockUser.findById.mockResolvedValue(mockUserData);
        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        // WHEN: Multiple middleware calls
        const promises = [
          protect(mockReq as any, mockRes as Response, mockNext),
          protect(mockReq as any, mockRes as Response, mockNext),
        ];

        await Promise.all(promises);

        // THEN: Should handle concurrent requests
        expect(mockJwt.verify).toHaveBeenCalledTimes(2);
        expect(mockUser.findById).toHaveBeenCalledTimes(2);
      });
    });

    describe('GIVEN database error during user lookup', () => {
      test('THEN should handle database error gracefully', async () => {
        // GIVEN: Database error
        const dbError = new Error('Database connection failed');
        mockJwt.verify.mockReturnValue({ id: 'user123' });
        mockUser.findById.mockRejectedValue(dbError);
        mockReq.headers = {
          authorization: 'Bearer valid-token',
        };

        // WHEN: Middleware is called
        await protect(mockReq as any, mockRes as Response, mockNext);

        // THEN: Should call next with error
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Not authorized to access this route',
          })
        );
      });
    });
  });
});
