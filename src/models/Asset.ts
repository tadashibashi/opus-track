import mongoose, {Schema, Types} from "mongoose";

// ===== Interfaces ============================================

interface ICredit {
    role: string;
    name: string;
    userId: Types.ObjectId | null;
}
export type CreditSubDoc = Types.Subdocument<ICredit>;


interface IMeta {
    title: string;
    credits: Types.Subdocument<ICredit>[];
    userId: Types.ObjectId;
}
export type MetaSubDoc = Types.Subdocument<IMeta>;


interface IAsset {
    type: string;
    user: Types.ObjectId;
    file: Types.ObjectId;
    meta: Types.Subdocument;
}
export type AssetDocument = mongoose.HydratedDocument<IAsset>;


// ===== Schemas ==============================================

const creditSchema = new Schema<ICredit>({
    role: String,
    name: String,
    userId: { // if referring to a specific Opus Track user, may be null: link to profile, etc.
        type: Schema.ObjectId,
        ref: "User",
        nullable: true,
        default: null,
    }
});
const metaSchema = new Schema<IMeta>({
    title: {
        type: String,
        require: true,
    },
    credits: {
        type: [creditSchema],
        default: [],
    }
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

export const Asset = mongoose.model("Asset", assetSchema);

export default Asset;
