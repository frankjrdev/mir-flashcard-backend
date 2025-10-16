import { EmailService } from '../../../services/email.service';
import { USerService } from '../../../services/user.service';
import { User } from '../../../models/User';

// Mock dependencies
jest.mock('../../../models/User');
jest.mock('../../../services/email.service.ts');
jest.mock('../../../services/jwt.service.ts');

const MockedEmailService = EmailService as jest.MockedClass<typeof EmailService>;

describe('UserService - Unit Test', () => {
  let userService: USerService;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new USerService();
    mockEmailService = MockedEmailService.mock.instances[0] as jest.Mocked<EmailService>;
  });

  describe('register', () => {
    it('should register a new user succesfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@gmail.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: userData.email,
        name: userData.name,
        isVerified: false,
        verificationToken: 'some-token',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      // Act
      const result = await userService.registerUser(userData);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        mockUser.verificationToken,
        userData.name
      );
      expect(result.email).toBe(userData.email);
      expect(result.isVerified).toBe(false);
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow('Email already in use');

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
    });
  });
});
