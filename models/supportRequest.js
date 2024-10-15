import mongoose from "mongoose";

const supportRequestSchema = mongoose.Schema({
  title: {
    type: String,
  },
  owner: {
    type: String,
  },
  date: {
    type: Date,
  },
  image: {
    type: Image,
  },
  severity: {
    type: Number,
  },
});

const SupportRequest = mongoose.model(
  "SupportRequest",
  supportRequestSchema,
  "supportRequest"
);

export { SupportRequest };
