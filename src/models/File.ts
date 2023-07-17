import mongoose, {Schema, Types} from "mongoose"

export interface IFile {
    filename: string,
    folder: string,
    // local on the server
    path: string,
    // full path on the local filesystem
    fullpath: string,
    mimetype: string,
    size: number,
    user: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

const fileSchema = new Schema<IFile>({
    filename: String,
    /// Virtual folder for end user
    folder: {
        type: String,
        default: "/", // user files root
    },
    // full filepath on the local system
    path: {
        type: String,
        required: true,
    },
    fullpath: {
        type: String,
        required: true,
    },
    mimetype: String,
    size: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true,
});

export type FileDocument = mongoose.HydratedDocument<IFile>;

export const File = mongoose.model("File", fileSchema);

export default File;
