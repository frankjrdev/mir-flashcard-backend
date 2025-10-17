import { IUserResponseDTO } from '../../../interfaces/user.interface';
import { JWTService } from '../../../services/jwt.service';
import jwt from 'jsonwebtoken';

describe('JWTService - Unit Test', () => {
  const mockUser: IUserResponseDTO = {
    id: '12345',
    email: 'test@example.com',
    name: 'Test User',
    isVerified: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  xdescribe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      // Arrange
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mocked-token' as any);

      // Act
      const token = JWTService.generateToken(mockUser);

      // Assert
      expect(signSpy).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        'fallback-secret',
        {
          expiresIn: '1d',
          issuer: 'mir-flashcard',
          audience: 'mir-flashcard-users',
        }
      );
      expect(token).toBe('mocked-token');
    });

    it('should use fallback values if env vars are not set', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mock-token' as any);

      // Act
      const token = JWTService.generateToken(mockUser);

      // Assert
      expect(signSpy).toHaveBeenCalledWith(expect.any(Object), 'fallback-secret', {
        expiresIn: '1d',
        issuer: 'mir-flashcard',
        audience: 'mir-flashcard-users',
      });
    });
  });
});
