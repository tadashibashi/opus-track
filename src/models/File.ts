import mongoose, {Schema} from "mongoose"

const fileSchema = new Schema({
    filename: String,
    path: String,
});

export default mongoose.model("File", fileSchema);
