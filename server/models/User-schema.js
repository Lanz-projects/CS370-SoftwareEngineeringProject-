const mongoose = require("mongoose");

const ContactInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["phone", "email", "social", "other"], // The different contacts the user can choose from
    required: true,
  },
  platform: {
    type: String,
    enum: [
      "Twitter",
      "Instagram",
      "Snapchat",
      "TikTok",
      "GroupMe", // If the user picks social then they get to pick the method of contact from the following list
      "Discord",
      "WhatsApp",
      "Messenger",
      "Facebook",
      "Other",
    ],
    required: function () {
      return this.type === "social";
    },
  },
  value: {
    type: String, // The value of the contact info the user chooses
    required: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      default: "",
    },
    vehicleid: {
      type: mongoose.Schema.Types.ObjectId, // Link to Vehicle collection
      ref: "Vehicle",
      default: null,
    },
    contactInfo: {
      type: [ContactInfoSchema],
      default: [],
    },
    completedUserProfile: {
      type: Boolean,
      default: false,
    },
    acceptedUserAgreement: {
      type: Boolean,
      default: false,
    },
    favoriteOfferings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Offering", default: [] },
    ], 
    favoriteRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Request", default: [] },
    ], 
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "Users" }
);

module.exports = mongoose.model("User", UserSchema);
