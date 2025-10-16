import { IUser, IUserLoginDTO, IUserResponseDTO } from '@/interfaces/user.interface';
import { EmailService } from './email.service';
import { IUserCreateDTO } from '../interfaces/user.interface';
import { User } from '@/models/User';
import { JWTService } from './jwt.service';

export class USerService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  private toUserResponseDTO(user: IUser): IUserResponseDTO {
    return {
      id: user._id!,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
    };
  }

  async registerUser(userData: IUserCreateDTO): Promise<IUserResponseDTO> {
    // Verify if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Create user
    const user = new User({
      ...userData,
      verificationToken:
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    });

    await user.save();

    // Send verification email to admin
    await this.emailService.sendVerificationEmail(
      user.email,
      user.verificationToken!,
      user.name || ''
    );

    return this.toUserResponseDTO(user);
  }

  async login(
    loginData: IUserLoginDTO
  ): Promise<{ user: IUserResponseDTO; token: string; expiresIn: string }> {
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify if user is verified
    if (!user.isVerified) {
      throw new Error('User not verified, Please contact admin');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const userResponse = this.toUserResponseDTO(user);
    const token = JWTService.generateToken(userResponse);

    return {
      user: userResponse,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    };
  }

  async verifyEmail(token: string): Promise<IUserResponseDTO> {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name || '');

    return this.toUserResponseDTO(user);
  }

  async getAllUsers(): Promise<IUserResponseDTO[]> {
    const users = await User.find();
    return users.map((user) => this.toUserResponseDTO(user));
  }

  async getUserById(userId: string): Promise<IUserResponseDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.toUserResponseDTO(user);
  }

  async editUser(userId: string, updateData: Partial<IUser>): Promise<IUserResponseDTO> {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw new Error('User not found');
    }
    return this.toUserResponseDTO(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
  }
}
