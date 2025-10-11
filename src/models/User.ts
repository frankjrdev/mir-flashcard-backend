import { Schema, model, Model, Document } from 'mongoose';
import { createBaseSchema, BaseDocument } from './BaseModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends BaseDocument {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    comparePassword(candidatePassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
}

const userSchema = createBaseSchema<IUser>({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Ensure JWT_EXPIRES_IN is in the correct format (e.g., '30d', '1h', '7d')
    const expiresIn = process.env.JWT_EXPIRES_IN && /^\d+[smhdwmy]$/.test(process.env.JWT_EXPIRES_IN)
        ? process.env.JWT_EXPIRES_IN
        : '30d';

    const payload = { id: this._id.toString() };
    const secret = process.env.JWT_SECRET;
    const options: jwt.SignOptions = { expiresIn: Number(process.env.JWT_EXPIRES_IN) };

    return jwt.sign(payload, secret, options);
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;