import mongoose, {Schema, Types} from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    username: string;
    googleId: string;
    email: string;
    avatar: string;
    avatarFile: Types.ObjectId | null;
    displayName: string;
    emailVerified: boolean;
    usertype: ("admin" | "user")[];
    infectedFileCount: number;
}

export const userSchema = new Schema({
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
    },
    googleId: {
        type: String,
        required: true,
    },
    email: String,
    avatar: String,
    avatarFile: {
        type: Schema.Types.ObjectId,
        ref: "File",
        nullable: true,
        default: null,
    },
    emailVerified: Boolean,
    usertype: {
        type: [String],
        enum: ["admin", "user"],
        default: ["user"],
    },
    infectedFileCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export const User = mongoose.model("User", userSchema);

export type UserDocument = mongoose.HydratedDocument<IUser>;

export default User;
