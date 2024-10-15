import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
//   fullName: {
//     type: String,
//     required: [true, "Please add a name"],
//   },
//   lastRequestDate: {
//     type: Date,
//     default: null,
//   },
});

const User = mongoose.model("User", userSchema, "user");

export { User };
