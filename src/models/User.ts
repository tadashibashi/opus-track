import mongoose, {Schema} from "mongoose";

export const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
});

const User = mongoose.model("User", userSchema);

export default User;
