import mongoose, {Schema} from "mongoose";

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
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
