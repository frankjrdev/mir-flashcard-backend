import { Document, Model, Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

const baseOptions = {
    timestamps: true,
    toJSON: {
        transform(doc: any, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
};

function createBaseSchema<T extends BaseDocument>(
    definition: Record<string, any>
) {
    const schema = new Schema<T>(
        {
            ...definition
        },
        baseOptions
    );

    schema.set('versionKey', 'version');
    schema.plugin(updateIfCurrentPlugin);

    return schema;
}

export { BaseDocument, createBaseSchema };