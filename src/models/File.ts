import mongoose, {Schema} from "mongoose"

export interface IFile {
    filename: string,
    folder: string,
    mimetype: string,
    size: number,
    user: mongoose.Types.ObjectId
}

const fileSchema = new Schema<IFile>({
    filename: String,
    folder: String,
    mimetype: String,
    size: Number,
    user: {
        type: Schema.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true,
});

export type FileDocument = mongoose.HydratedDocument<IFile>;

export const File = mongoose.model("File", fileSchema);

export default File;
