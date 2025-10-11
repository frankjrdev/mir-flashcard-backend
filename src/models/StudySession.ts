import { Schema, model, Model, Document, Types } from 'mongoose';
import { createBaseSchema, BaseDocument } from './BaseModel';

export interface IStudySession extends BaseDocument {
    user: Types.ObjectId;
    subject: Types.ObjectId;
    duration: number; // in minutes
    cardsStudied: number;
    correctAnswers: number;
    incorrectAnswers: number;
}

const studySessionSchema = createBaseSchema<IStudySession>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    cardsStudied: {
        type: Number,
        required: true,
        min: 0
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    incorrectAnswers: {
        type: Number,
        required: true,
        min: 0
    }
});

const StudySession: Model<IStudySession> = model<IStudySession>('StudySession', studySessionSchema);

export default StudySession;