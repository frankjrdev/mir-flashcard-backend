import { Request, Response, NextFunction } from 'express';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';
import { errorHandler, ErrorWithStatus } from '../middlewares/errorHandler';

describe('Utils', () => {
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

      describe('WHEN sending error response', () => {
        test('THEN should send error response format', () => {
          // GIVEN: Error response
          const errorData = { error: 'Validation failed' };

          // WHEN: Function is called
          sendResponse(mockRes as Response, 400, false, 'Bad Request', errorData);

          // THEN: Should send error response
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            statusCode: 400,
            message: 'Bad Request',
            data: errorData,
          });
        });
      });

      describe('WHEN sending response with meta data', () => {
        test('THEN should include meta information', () => {
          // GIVEN: Response with meta data
          const testData = [{ id: '1' }, { id: '2' }];
          const metaData = {
            page: 1,
            limit: 10,
            totalPages: 5,
          };

          // WHEN: Function is called
          sendResponse(mockRes as Response, 200, true, 'Success', testData, metaData);

          // THEN: Should include meta data
          expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            statusCode: 200,
            message: 'Success',
            data: testData,
            meta: metaData,
          });
        });
      });

      describe('WHEN sending response with null data', () => {
        test('THEN should handle null data gracefully', () => {
          // GIVEN: Response with null data
          // WHEN: Function is called
          sendResponse(mockRes as Response, 200, true, 'Success', null);

          // THEN: Should not include data field
          expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            statusCode: 200,
            message: 'Success',
          });
        });
      });

      describe('WHEN sending response with undefined data', () => {
        test('THEN should handle undefined data gracefully', () => {
          // GIVEN: Response with undefined data
          // WHEN: Function is called
          sendResponse(mockRes as Response, 200, true, 'Success', undefined);

          // THEN: Should not include data field
          expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            statusCode: 200,
            message: 'Success',
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

    describe('GIVEN an async function that throws different error types', () => {
      describe('WHEN async function throws TypeError', () => {
        test('THEN should catch TypeError and call next', async () => {
          // GIVEN: TypeError
          const typeError = new TypeError('Type error');
          const mockAsyncFn = jest.fn().mockRejectedValue(typeError);
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should catch TypeError
          expect(mockNext).toHaveBeenCalledWith(typeError);
        });
      });

      describe('WHEN async function throws ReferenceError', () => {
        test('THEN should catch ReferenceError and call next', async () => {
          // GIVEN: ReferenceError
          const referenceError = new ReferenceError('Reference error');
          const mockAsyncFn = jest.fn().mockRejectedValue(referenceError);
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should catch ReferenceError
          expect(mockNext).toHaveBeenCalledWith(referenceError);
        });
      });
    });

    describe('GIVEN an async function with different return types', () => {
      describe('WHEN async function returns Promise', () => {
        test('THEN should handle Promise return', async () => {
          // GIVEN: Function returning Promise
          const mockAsyncFn = jest.fn().mockReturnValue(Promise.resolve('promise result'));
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should handle Promise
          expect(mockAsyncFn).toHaveBeenCalled();
          expect(mockNext).not.toHaveBeenCalled();
        });
      });

      describe('WHEN async function returns synchronous value', () => {
        test('THEN should handle synchronous return', async () => {
          // GIVEN: Function returning synchronous value
          const mockAsyncFn = jest.fn().mockReturnValue('sync result');
          const wrappedFn = asyncHandler(mockAsyncFn);

          // WHEN: Wrapped function is called
          await wrappedFn(mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should handle synchronous return
          expect(mockAsyncFn).toHaveBeenCalled();
          expect(mockNext).not.toHaveBeenCalled();
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

      describe('WHEN handling duplicate key error with multiple fields', () => {
        test('THEN should return 400 with first duplicate field message', () => {
          // GIVEN: Duplicate key error with multiple fields
          const duplicateError = new Error('Duplicate field value');
          (duplicateError as any).code = 11000;
          (duplicateError as any).keyValue = {
            email: 'test@example.com',
            username: 'testuser',
          };

          // WHEN: Error handler is called
          errorHandler(duplicateError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 400 with first field
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

      describe('WHEN handling validation error with single field', () => {
        test('THEN should return 400 with single validation message', () => {
          // GIVEN: Single field validation error
          const validationError = new Error('Validation failed');
          (validationError as any).name = 'ValidationError';
          (validationError as any).errors = {
            email: { message: 'Please add a valid email' },
          };

          // WHEN: Error handler is called
          errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should return 400 with single message
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Please add a valid email',
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

      describe('WHEN handling error with statusCode', () => {
        test('THEN should use provided statusCode', () => {
          // GIVEN: Error with statusCode
          const errorWithStatus = new Error('Custom error') as ErrorWithStatus;
          errorWithStatus.statusCode = 422;

          // WHEN: Error handler is called
          errorHandler(errorWithStatus, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should use provided statusCode
          expect(mockRes.status).toHaveBeenCalledWith(422);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Custom error',
          });
        });
      });

      describe('WHEN handling error without message', () => {
        test('THEN should use default server error message', () => {
          // GIVEN: Error without message
          const errorWithoutMessage = new Error();
          errorWithoutMessage.message = '';

          // WHEN: Error handler is called
          errorHandler(errorWithoutMessage, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should use default message
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Server Error',
          });
        });
      });
    });

    describe('GIVEN an error with special characters', () => {
      describe('WHEN handling error with special characters in message', () => {
        test('THEN should handle special characters correctly', () => {
          // GIVEN: Error with special characters
          const specialCharError = new Error('Error with special chars: @#$%^&*()');

          // WHEN: Error handler is called
          errorHandler(specialCharError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should handle special characters
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Error with special chars: @#$%^&*()',
          });
        });
      });
    });

    describe('GIVEN an error with very long message', () => {
      describe('WHEN handling error with very long message', () => {
        test('THEN should handle long message correctly', () => {
          // GIVEN: Error with very long message
          const longMessage = 'A'.repeat(10000);
          const longError = new Error(longMessage);

          // WHEN: Error handler is called
          errorHandler(longError, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should handle long message
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: longMessage,
          });
        });
      });
    });

    describe('GIVEN an error with undefined properties', () => {
      describe('WHEN handling error with undefined properties', () => {
        test('THEN should handle undefined properties gracefully', () => {
          // GIVEN: Error with undefined properties
          const errorWithUndefined = new Error('Test error') as any;
          errorWithUndefined.name = undefined;
          errorWithUndefined.code = undefined;
          errorWithUndefined.keyValue = undefined;
          errorWithUndefined.errors = undefined;

          // WHEN: Error handler is called
          errorHandler(errorWithUndefined, mockReq as Request, mockRes as Response, mockNext);

          // THEN: Should handle undefined properties
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Test error',
          });
        });
      });
    });
  });

  // CASOS BORDE ADICIONALES
  describe('Edge Cases', () => {
    describe('GIVEN concurrent error handling', () => {
      test('THEN should handle concurrent errors', () => {
        // GIVEN: Multiple concurrent errors
        const error1 = new Error('Error 1');
        const error2 = new Error('Error 2');

        // WHEN: Error handler is called concurrently
        errorHandler(error1, mockReq as Request, mockRes as Response, mockNext);
        errorHandler(error2, mockReq as Request, mockRes as Response, mockNext);

        // THEN: Should handle both errors
        expect(mockRes.status).toHaveBeenCalledTimes(2);
        expect(mockRes.json).toHaveBeenCalledTimes(2);
      });
    });

    describe('GIVEN null or undefined error', () => {
      test('THEN should handle null error gracefully', () => {
        // GIVEN: Null error
        // WHEN: Error handler is called with null
        errorHandler(null as any, mockReq as Request, mockRes as Response, mockNext);

        // THEN: Should handle null error
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Server Error',
        });
      });

      test('THEN should handle undefined error gracefully', () => {
        // GIVEN: Undefined error
        // WHEN: Error handler is called with undefined
        errorHandler(undefined as any, mockReq as Request, mockRes as Response, mockNext);

        // THEN: Should handle undefined error
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Server Error',
        });
      });
    });

    describe('GIVEN error with circular references', () => {
      test('THEN should handle circular references', () => {
        // GIVEN: Error with circular references
        const circularError = new Error('Circular error');
        (circularError as any).circular = circularError;

        // WHEN: Error handler is called
        errorHandler(circularError, mockReq as Request, mockRes as Response, mockNext);

        // THEN: Should handle circular references
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Circular error',
        });
      });
    });

    describe('GIVEN error with non-string message', () => {
      test('THEN should handle non-string message', () => {
        // GIVEN: Error with non-string message
        const nonStringError = new Error() as any;
        nonStringError.message = 123;

        // WHEN: Error handler is called
        errorHandler(nonStringError, mockReq as Request, mockRes as Response, mockNext);

        // THEN: Should handle non-string message
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: 'Server Error',
        });
      });
    });
  });
});
