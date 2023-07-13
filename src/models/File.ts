import mongoose, {Schema} from "mongoose"

interface IFile {
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

export default mongoose.model("File", fileSchema);
