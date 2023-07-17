import mongoose, {Schema, Types} from "mongoose";

interface IPortfolio {
    assets: Types.ObjectId,
    owner: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

export type ProfileDocument = mongoose.HydratedDocument<IPortfolio>;

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

export type PortfolioDocument = mongoose.HydratedDocument<IPortfolio>;

export const Portfolio = mongoose.model("Profile", profileSchema);

export default Portfolio;