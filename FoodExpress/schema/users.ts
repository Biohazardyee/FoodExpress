import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
    _id: Schema.Types.ObjectId;
    email: string;
    username: string;
    password: string;
    roles: string[];
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], default: ["user"] }
}, {
    timestamps: true
});

// Remove sensitive fields when sending JSON responses
UserSchema.set('toJSON', {
    transform: function (_doc, ret) {
        const r: any = ret;
        r.id = r._id;
        delete r._id;
        delete r.__v;
        delete r.password; // remove hashed password
        return r;
    }
});

export const User = mongoose.model<IUser>('User', UserSchema);