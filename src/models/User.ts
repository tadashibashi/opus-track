import mongoose, {Schema} from "mongoose";

export const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true,
    },
    email: String,
    avatar: String,
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
