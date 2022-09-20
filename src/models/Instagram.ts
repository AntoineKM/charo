import { model, Schema } from "mongoose";

const instagramSchema = new Schema({
  account: { type: Object, required: true },
  createdAt: { type: Date, required: true },
});

export default model("Instagram", instagramSchema);
