import mongoose, {Schema, Types} from "mongoose";

interface IPortfolio {
    assets: Types.ObjectId[],
    owner: Types.ObjectId,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
}

const portfolioSchema = new Schema<IPortfolio>({
    assets: {
        type: [Schema.ObjectId],
        ref: "Asset",
    },
    owner: {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

export type PortfolioDocument = mongoose.HydratedDocument<IPortfolio>;

export const Portfolio = mongoose.model("Profile", portfolioSchema);

export default Portfolio;