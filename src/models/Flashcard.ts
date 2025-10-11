import { Schema, model, Model, Document, Types } from 'mongoose';
import { createBaseSchema, BaseDocument } from './BaseModel';

export interface IFlashcard extends BaseDocument {
    question: string;
    answer: string;
    subject: Types.ObjectId;
    createdBy: Types.ObjectId;
    difficulty: 'easy' | 'medium' | 'hard';
    nextReviewDate: Date;
    lastReviewed?: Date;
    reviewCount: number;
}

const flashcardSchema = createBaseSchema<IFlashcard>({
    question: {
        type: String,
        required: [true, 'Please add a question'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Please add an answer'],
        trim: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    nextReviewDate: {
        type: Date,
        default: Date.now
    },
    lastReviewed: {
        type: Date
    },
    reviewCount: {
        type: Number,
        default: 0
    }
});

const Flashcard: Model<IFlashcard> = model<IFlashcard>('Flashcard', flashcardSchema);

export default Flashcard;