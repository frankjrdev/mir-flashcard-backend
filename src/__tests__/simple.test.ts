import { Request, Response, NextFunction } from 'express';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';
import { errorHandler } from '../middlewares/errorHandler';

// No mocks needed for these tests

// No need for mock since we're testing the actual functions

describe('Simple Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('sendResponse', () => {
    describe('GIVEN a successful response', () => {
      describe('WHEN sending success response with data', () => {
        test('THEN should send correct response format', () => {
          // GIVEN: Success response with data
          const testData = { id: '123', name: 'Test' };

          // WHEN: Function is called
          sendResponse(mockRes as Response, 200, true, 'Success', testData);

          // THEN: Should send correct response
          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            statusCode: 200,
            message: 'Success',
            data: testData,
          });
        });
      });

      describe('WHEN sending success response without data', () => {
        test('THEN should send response without data field', () => {
          // GIVEN: Success response without data
          // WHEN: Function is called
          sendResponse(mockRes as Response, 201, true, 'Created');

          // THEN: Should send response without data
          expect(mockRes.status).toHaveBeenCalledWith(201);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            statusCode: 201,
            message: 'Created',
          });
        });
      });
    });
  });

  describe('asyncHandler', () => {
    describe('GIVEN an async function that succeeds', () => {
      describe('WHEN async function resolves', () => {
        test('THEN should execute function and not call next', async () => {
          // GIVEN: Successful async function
          const mockAsyncFn = jest.fn().mockResolvedValue('success');
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should execute function and not call next
          expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
          expect(mockNext).not.toHaveBeenCalled();
        });
      });
    });

    describe('GIVEN an async function that throws error', () => {
      describe('WHEN async function rejects', () => {
        test('THEN should catch error and call next with error', async () => {
          // GIVEN: Failing async function
          const testError = new Error('Test error');
          const mockAsyncFn = jest.fn().mockRejectedValue(testError);
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should catch error and call next
          expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
          expect(mockNext).toHaveBeenCalledWith(testError);
        });
      });
    });
  });

  describe('errorHandler', () => {
    describe('GIVEN a Mongoose CastError', () => {
      describe('WHEN handling CastError', () => {
        test('THEN should return 404 with resource not found message', () => {
          // GIVEN: CastError
          const castError = new Error('Cast to ObjectId failed for value "invalid" at path "_id"');
          (castError as any).name = 'CastError';

          // WHEN: Error handler is called
          errorHandler(castError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 404
          expect(mockRes.status).toHaveBeenCalledWith(404);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Resource not found',
          });
        });
      });
    });

    describe('GIVEN a Mongoose duplicate key error', () => {
      describe('WHEN handling duplicate key error', () => {
        test('THEN should return 400 with duplicate field message', () => {
          // GIVEN: Duplicate key error
          const duplicateError = new Error('Duplicate field value');
          (duplicateError as any).code = 11000;
          (duplicateError as any).keyValue = { email: 'test@example.com' };

          // WHEN: Error handler is called
          errorHandler(duplicateError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 400
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Duplicate field value: email. Please use another value',
          });
        });
      });
    });

    describe('GIVEN a Mongoose validation error', () => {
      describe('WHEN handling validation error', () => {
        test('THEN should return 400 with validation messages', () => {
          // GIVEN: Validation error
          const validationError = new Error('Validation failed');
          (validationError as any).name = 'ValidationError';
          (validationError as any).errors = {
            email: { message: 'Please add a valid email' },
            password: { message: 'Password must be at least 6 characters' },
          };

          // WHEN: Error handler is called
          errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 400 with validation messages
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Please add a valid email, Password must be at least 6 characters',
          });
        });
      });
    });

    describe('GIVEN a generic error', () => {
      describe('WHEN handling generic error', () => {
        test('THEN should return 500 with server error message', () => {
          // GIVEN: Generic error
          const genericError = new Error('Something went wrong');

          // WHEN: Error handler is called
          errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 500
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Something went wrong',
          });
        });
      });
    });
  });
});
