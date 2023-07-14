import mongoose, {Schema} from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    username: string;
    googleId: string;
    email: string;
    avatar: string;
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
    googleId: {
        type: String,
        required: true,
    },
    email: String,
    avatar: String,
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

const User = mongoose.model("User", userSchema);

export type UserDocument = mongoose.HydratedDocument<IUser>;

export default User;
