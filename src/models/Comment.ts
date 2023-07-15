import mongoose, {Schema, Types} from "mongoose";

interface IRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface IComment {
    text: string;
    region: IRegion;
    author: Types.ObjectId;
    asset: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const regionSchema = new Schema<IRegion>({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true},
});


const commentSchema = new Schema<IComment>({
    text: {
        type: String,
        required: true,
    },
    region: {
        type: regionSchema,
        default: { x: 0, y: 0, width: 0, height: 0 },
    },
    author: {
        type: Schema.ObjectId,
        ref: "User",
    },
    asset: {
        type: Schema.ObjectId,
        ref: "Asset",
    }
}, {
    timestamps: true,
});

export type CommentDocument = mongoose.HydratedDocument<IComment>;

export const Comment = mongoose.model("Comment", commentSchema);

export default Comment;