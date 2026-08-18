import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface ISiteContent extends Document {
  key: string;
  homeTagline: string;
  aboutContent: string;
}

const SiteContentSchema =
  new Schema<ISiteContent>(
    {
      key: {
        type: String,
        required: true,
        unique: true,
        default: "main",
      },

      homeTagline: {
        type: String,
        required: true,
        default:
          "Beautifully crafted maps celebrating\nEthiopia & Africa's cities.",
      },

      aboutContent: {
        type: String,
        required: true,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent ||
  mongoose.model<ISiteContent>(
    "SiteContent",
    SiteContentSchema
  );

export default SiteContent;