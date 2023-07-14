import mongoose, {Schema} from "mongoose";

const creditSchema = new Schema({
    role: String,
    name: String,
    userId: { // if referring to a specific Opus Track user, may be null: link to profile, etc.
        type: Schema.ObjectId,
        ref: "User",
        nullable: true,
        default: null,
    }
});

const metaSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
});

export enum AssetType {
    Audio = "Audio",
    Image = "Image",
    Video = "Video",
    Doc = "Doc",
}

const assetTypes = Object.keys(AssetType);

const assetSchema = new Schema({
    type: {
        type: String,
        enum: assetTypes,
        required: true,
    },
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: false, // just in case we want to create assets for some other purpose...
        nullable: true,
        default: null,
    },
    file: {
        type: Schema.ObjectId,
        ref: "File",
        required: true,
    },
    meta: {
        type: metaSchema,
        required: true,
    }
});

export default mongoose.model("Asset", assetSchema);