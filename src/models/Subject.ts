import { Schema, model, Model, Document, Types } from 'mongoose';
import { createBaseSchema, BaseDocument } from './BaseModel';

export interface ISubject extends BaseDocument {
    name: string;
    description?: string;
    createdBy: Types.ObjectId;
}

const subjectSchema = createBaseSchema<ISubject>({
    name: {
        type: String,
        required: [true, 'Please add a subject name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Subject: Model<ISubject> = model<ISubject>('Subject', subjectSchema);

export default Subject;