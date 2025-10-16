import { EmailService } from '../../../services/email.service';
import { USerService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { JWTService } from '../../../services/jwt.service';

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

  describe('registerUser', () => {
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

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: loginData.email,
        name: 'Test User',
        isVerified: true,
        lastLogin: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (JWTService.generateToken as jest.Mock).mockReturnValue('jwt-token');

      // Act
      const result = await userService.login(loginData);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockUser.save).toHaveBeenCalled();
      expect(JWTService.generateToken).toHaveBeenCalled();
      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should throw error if user is not verified', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        email: loginData.email,
        isVerified: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.login(loginData)).rejects.toThrow(
        'User not verified, Please contact admin'
      );
    });
    it('should throw error with invalid password', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        email: loginData.email,
        isVerified: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const token = 'valid-token';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.test',
        name: 'Test User',
        isVerified: false,
        verificationToken: token,
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.verifyEmail(token);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ verificationToken: token });
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.email).toBe(mockUser.email);
      expect(result.isVerified).toBe(true);
    });

    it('should throw error with invalid or expired token', async () => {
      // Arrange
      const token = 'invalid-token';

      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.verifyEmail(token)).rejects.toThrow(
        'Invalid or expired verification token'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user data for valid user ID', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
      expect(User.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAllUsers', () => {
    it('should return list of all users', async () => {
      // Arrange
      const mockUsers = [
        {
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          isVerified: true,
        },
        {
          _id: '507f1f77bcf86cd799439012',
          email: 'test2@example.com',
          name: 'Test User2',
          isVerified: true,
        },
        {
          _id: '507f1f77bcf86cd799439013',
          email: 'test2@example.com',
          name: 'Test User3',
          isVerified: true,
        },
      ];

      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(User.find).toHaveBeenCalled();
      expect(result.length).toBe(3);
    });
  });

  describe('editUser', () => {
    it('should update user data successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        _id: userId,
        name: 'Updated User',
        email: 'test@example.com',
        role: 'user',
        isVerified: true,
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'User Before Update',
        role: 'user',
        isVerified: true,
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updateData);

      // Act
      const result = await userService.editUser(userId, { name: 'Updated User' });

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { name: 'Updated User' },
        { new: true }
      );
      expect(result.name).toBe('Updated User');
      expect(result.email).toBe(mockUser.email);
      expect(mockUser.name).not.toBe(updateData.name);
    });

    it('should throw error if user to update not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.editUser(userId, { name: 'Updated User' })).rejects.toThrow(
        'User not found'
      );
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { name: 'Updated User' },
        { new: true }
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true,
      };

      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await userService.deleteUser(userId);

      // Assert
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user to delete not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });
  });
});
