import { IUserResponseDTO } from '@/interfaces/user.interface';
import jwt from 'jsonwebtoken';

export class JWTService {
  private static readonly secret = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  static generateToken(user: IUserResponseDTO): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
