import { IUserResponseDTO } from '@/interfaces/user.interface';
import jwt from 'jsonwebtoken';

export class JWTService {
  private static readonly secret = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly expiresIn: jwt.SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN ||
    '1d') as jwt.SignOptions['expiresIn'];

  static generateToken(user: IUserResponseDTO): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const options: jwt.SignOptions = {
      expiresIn: this.expiresIn,
      issuer: 'mir-flashcard',
      audience: 'mir-flashcard-users',
    };

    return jwt.sign(payload, this.secret, options);
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new Error('Invalid token' + (err instanceof Error ? err.message : ''));
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
