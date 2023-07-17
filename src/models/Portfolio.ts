import mongoose, {Schema, Types} from "mongoose";

interface IProfile {
    assets: Types.ObjectId,
    user: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

export type ProfileDocument = mongoose.HydratedDocument<IProfile>;

const profileSchema = new Schema({
    assets: {
        type: [Schema.ObjectId],
        ref: "Asset",
    },
    owner: {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

export const Profile = mongoose.model("Profile", profileSchema);
